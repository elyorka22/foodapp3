/**
 * Telegram bots env resolution.
 *
 * Default: ONE bot for login (HMAC) and user messaging (webhook).
 * Optional: set TELEGRAM_MESSAGING_BOT_TOKEN if messaging must use a different bot
 * than TELEGRAM_BOT_TOKEN (login widget). Both usernames should match the tokens.
 */

export function resolveLoginBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || undefined;
}

/** Webhook + sendMessage — falls back to login token. */
export function resolveMessagingBotToken(): string | undefined {
  return (
    process.env.TELEGRAM_MESSAGING_BOT_TOKEN?.trim() ||
    process.env.TELEGRAM_BOT_TOKEN?.trim() ||
    undefined
  );
}

export function resolveConfiguredBotUsername(): string | undefined {
  return (
    process.env.TELEGRAM_MESSAGING_BOT_USERNAME?.trim() ||
    process.env.TELEGRAM_BOT_USERNAME?.trim() ||
    undefined
  );
}

export type TelegramBotIdentity = {
  id: number;
  username: string;
  firstName: string;
  isBot: boolean;
};

export async function fetchTelegramBotIdentity(
  token: string,
): Promise<TelegramBotIdentity | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = (await res.json()) as {
      ok: boolean;
      result?: { id: number; username?: string; first_name?: string; is_bot?: boolean };
    };
    if (!data.ok || !data.result?.username) return null;
    return {
      id: data.result.id,
      username: data.result.username,
      firstName: data.result.first_name ?? '',
      isBot: data.result.is_bot ?? true,
    };
  } catch {
    return null;
  }
}

export function usernamesMatch(a?: string | null, b?: string | null): boolean {
  if (!a?.trim() || !b?.trim()) return true;
  return a.replace(/^@/, '').toLowerCase() === b.replace(/^@/, '').toLowerCase();
}
