import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { buildTelegramWebhookUrl } from './telegram-bot-webhook.util';

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

@Injectable()
export class TelegramBotWebhookService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotWebhookService.name);

  private get token(): string | undefined {
    return process.env.TELEGRAM_BOT_TOKEN?.trim() || undefined;
  }

  onModuleInit() {
    if (!this.token) return;
    void this.registerWebhook().then((result) => {
      if (result.ok) {
        this.logger.log(`Telegram webhook registered: ${result.url}`);
      } else if (result.missingEnv.length) {
        this.logger.warn(
          `Telegram webhook not registered — missing env: ${result.missingEnv.join(', ')}`,
        );
      } else {
        this.logger.warn(`Telegram webhook registration failed: ${result.error ?? 'unknown'}`);
      }
    });
  }

  async getStatus(): Promise<TelegramWebhookStatus> {
    const missingEnv: string[] = [];
    if (!this.token) missingEnv.push('TELEGRAM_BOT_TOKEN');
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
    if (!this.token) missingEnv.push('TELEGRAM_BOT_TOKEN');
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
