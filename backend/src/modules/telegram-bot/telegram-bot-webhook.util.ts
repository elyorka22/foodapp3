/** Public API base, e.g. https://foodapp.uz (no trailing slash). */
export function resolveApiPublicUrl(): string | undefined {
  const explicit = process.env.API_PUBLIC_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const corsOrigin = process.env.CORS_ORIGINS?.split(',')[0]?.trim();
  if (corsOrigin?.startsWith('http')) return corsOrigin.replace(/\/$/, '');

  return undefined;
}

/** Webhook path secret — NOT the bot token and NOT a curl command. */
export function resolveWebhookSecret(): string | undefined {
  const raw = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!raw) return undefined;
  if (!isValidWebhookSecret(raw)) return undefined;
  return raw;
}

export function isValidWebhookSecret(secret: string): boolean {
  if (secret.length < 16 || secret.length > 128) return false;
  if (/https?:\/\//i.test(secret) || secret.includes('curl') || secret.includes('telegram.org')) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(secret);
}

export function webhookSecretValidationError(secret?: string): string | null {
  const raw = secret?.trim() ?? process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!raw) return 'TELEGRAM_WEBHOOK_SECRET is empty';
  if (/https?:\/\//i.test(raw) || raw.includes('curl') || raw.includes('telegram.org')) {
    return 'TELEGRAM_WEBHOOK_SECRET must be a random string only — not a URL or curl command';
  }
  if (raw.length < 16) return 'TELEGRAM_WEBHOOK_SECRET must be at least 16 characters';
  if (raw.length > 128) return 'TELEGRAM_WEBHOOK_SECRET is too long';
  if (!/^[A-Za-z0-9_-]+$/.test(raw)) {
    return 'TELEGRAM_WEBHOOK_SECRET may only contain letters, numbers, _ and -';
  }
  return null;
}

export function buildTelegramWebhookUrl(): string | null {
  const base = resolveApiPublicUrl();
  const secret = resolveWebhookSecret();
  if (!base || !secret) return null;
  return `${base}/api/v1/telegram-bot/webhook/${secret}`;
}
