import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { buildTelegramWebhookUrl } from './telegram-bot-webhook.util';
import {
  fetchTelegramBotIdentity,
  resolveConfiguredBotUsername,
  resolveLoginBotToken,
  resolveMessagingBotToken,
  usernamesMatch,
  type TelegramBotIdentity,
} from './telegram-bot-env';

type TelegramApiResponse<T = unknown> = {
  ok: boolean;
  description?: string;
  result?: T;
};

export type TelegramWebhookStatus = {
  configured: boolean;
  registered: boolean;
  url: string | null;
  expectedUrl: string | null;
  lastErrorMessage?: string | null;
  pendingUpdateCount?: number;
  missingEnv: string[];
};

export type TelegramBotDiagnostics = {
  usesSeparateMessagingToken: boolean;
  configuredUsername: string | null;
  messagingBot: TelegramBotIdentity | null;
  loginBot: TelegramBotIdentity | null;
  usernameMatchesMessaging: boolean;
  usernameMatchesLogin: boolean;
  openBotLink: string | null;
  note: string;
};

@Injectable()
export class TelegramBotWebhookService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotWebhookService.name);

  private get token(): string | undefined {
    return resolveMessagingBotToken();
  }

  async getDiagnostics(): Promise<TelegramBotDiagnostics> {
    const messagingToken = resolveMessagingBotToken();
    const loginToken = resolveLoginBotToken();
    const configuredUsername = resolveConfiguredBotUsername() ?? null;
    const usesSeparateMessagingToken = Boolean(
      process.env.TELEGRAM_MESSAGING_BOT_TOKEN?.trim() &&
        process.env.TELEGRAM_MESSAGING_BOT_TOKEN?.trim() !== loginToken,
    );

    const [messagingBot, loginBot] = await Promise.all([
      messagingToken ? fetchTelegramBotIdentity(messagingToken) : Promise.resolve(null),
      loginToken && loginToken !== messagingToken
        ? fetchTelegramBotIdentity(loginToken)
        : Promise.resolve(null),
    ]);

    const usernameMatchesMessaging = usernamesMatch(configuredUsername, messagingBot?.username);
    const usernameMatchesLogin = usernamesMatch(
      process.env.TELEGRAM_BOT_USERNAME?.trim(),
      loginBot?.username ?? messagingBot?.username,
    );

    return {
      usesSeparateMessagingToken,
      configuredUsername,
      messagingBot,
      loginBot,
      usernameMatchesMessaging,
      usernameMatchesLogin,
      openBotLink: messagingBot?.username ? `https://t.me/${messagingBot.username}` : null,
      note:
        'Default: one bot (TELEGRAM_BOT_TOKEN) for login and messages. Optional TELEGRAM_MESSAGING_BOT_TOKEN only if messaging uses a different bot.',
    };
  }

  onModuleInit() {
    if (!this.token) return;
    void Promise.all([this.registerWebhook(), this.getDiagnostics()]).then(([result, diag]) => {
      if (result.ok) {
        this.logger.log(`Telegram webhook registered: ${result.url}`);
      } else if (result.missingEnv.length) {
        this.logger.warn(
          `Telegram webhook not registered — missing env: ${result.missingEnv.join(', ')}`,
        );
      } else {
        this.logger.warn(`Telegram webhook registration failed: ${result.error ?? 'unknown'}`);
      }

      if (diag.messagingBot) {
        this.logger.log(
          `Telegram messaging bot: @${diag.messagingBot.username} (open t.me/${diag.messagingBot.username})`,
        );
      }
      if (!diag.usernameMatchesMessaging) {
        this.logger.warn(
          `TELEGRAM_BOT_USERNAME (${diag.configuredUsername ?? '—'}) does not match messaging bot @${diag.messagingBot?.username ?? '?'}`,
        );
      }
      if (diag.loginBot && diag.loginBot.username !== diag.messagingBot?.username) {
        this.logger.warn(
          `Login bot @${diag.loginBot.username} differs from messaging bot @${diag.messagingBot?.username ?? '?'}`,
        );
      }
    });
  }

  async getStatus(): Promise<TelegramWebhookStatus> {
    const missingEnv: string[] = [];
    if (!this.token) missingEnv.push('TELEGRAM_BOT_TOKEN or TELEGRAM_MESSAGING_BOT_TOKEN');
    if (!process.env.TELEGRAM_WEBHOOK_SECRET?.trim()) missingEnv.push('TELEGRAM_WEBHOOK_SECRET');
    if (!buildTelegramWebhookUrl()) missingEnv.push('API_PUBLIC_URL (or CORS_ORIGINS)');

    const expectedUrl = buildTelegramWebhookUrl();
    if (!this.token || !expectedUrl) {
      return {
        configured: Boolean(this.token),
        registered: false,
        url: null,
        expectedUrl,
        missingEnv,
      };
    }

    const info = await this.fetchWebhookInfo();
    const currentUrl = info?.url ?? null;
    const registered = Boolean(currentUrl && currentUrl === expectedUrl);

    return {
      configured: true,
      registered,
      url: currentUrl,
      expectedUrl,
      lastErrorMessage: info?.last_error_message ?? null,
      pendingUpdateCount: info?.pending_update_count,
      missingEnv,
    };
  }

  async registerWebhook(): Promise<{
    ok: boolean;
    url?: string;
    error?: string;
    missingEnv: string[];
  }> {
    const missingEnv: string[] = [];
    if (!this.token) missingEnv.push('TELEGRAM_BOT_TOKEN or TELEGRAM_MESSAGING_BOT_TOKEN');
    if (!process.env.TELEGRAM_WEBHOOK_SECRET?.trim()) missingEnv.push('TELEGRAM_WEBHOOK_SECRET');

    const url = buildTelegramWebhookUrl();
    if (!url) {
      if (!process.env.API_PUBLIC_URL?.trim() && !process.env.CORS_ORIGINS?.trim()) {
        missingEnv.push('API_PUBLIC_URL (or CORS_ORIGINS)');
      }
      return { ok: false, missingEnv, error: 'Webhook URL could not be built' };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: false,
        }),
      });
      const data = (await res.json()) as TelegramApiResponse;
      if (!data.ok) {
        return { ok: false, url, missingEnv, error: data.description ?? 'setWebhook failed' };
      }
      return { ok: true, url, missingEnv };
    } catch (err) {
      return {
        ok: false,
        url,
        missingEnv,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async fetchWebhookInfo(): Promise<{
    url?: string;
    last_error_message?: string;
    pending_update_count?: number;
  } | null> {
    if (!this.token) return null;
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.token}/getWebhookInfo`);
      const data = (await res.json()) as TelegramApiResponse<{
        url?: string;
        last_error_message?: string;
        pending_update_count?: number;
      }>;
      return data.ok ? (data.result ?? null) : null;
    } catch {
      return null;
    }
  }
}
