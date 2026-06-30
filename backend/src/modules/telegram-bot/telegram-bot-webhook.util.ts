/** Public API base, e.g. https://foodapp.uz (no trailing slash). */
export function resolveApiPublicUrl(): string | undefined {
  const explicit = process.env.API_PUBLIC_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const corsOrigin = process.env.CORS_ORIGINS?.split(',')[0]?.trim();
  if (corsOrigin?.startsWith('http')) return corsOrigin.replace(/\/$/, '');

  return undefined;
}

export function buildTelegramWebhookUrl(): string | null {
  const base = resolveApiPublicUrl();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!base || !secret) return null;
  return `${base}/api/v1/telegram-bot/webhook/${secret}`;
}
