import { createHash, createHmac, timingSafeEqual } from 'crypto';

/**
 * Telegram signed user payload (snake_case).
 * Identical across Login Widget, Flutter telegram_login, and Telegram mobile SDKs.
 */
export type TelegramLoginPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const MAX_AUTH_AGE_SEC = 86400;

export function buildTelegramDataCheckString(
  data: Record<string, string | number>,
): string {
  return Object.keys(data)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
}

export function verifyTelegramLoginHash(
  payload: TelegramLoginPayload,
  botToken: string,
): boolean {
  if (!botToken?.trim()) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec - payload.auth_date > MAX_AUTH_AGE_SEC) return false;

  const fields: Record<string, string | number> = {
    id: payload.id,
    first_name: payload.first_name,
    auth_date: payload.auth_date,
  };
  if (payload.last_name) fields.last_name = payload.last_name;
  if (payload.username) fields.username = payload.username;
  if (payload.photo_url) fields.photo_url = payload.photo_url;

  const checkString = buildTelegramDataCheckString(fields);
  const secretKey = createHash('sha256').update(botToken).digest();
  const computed = createHmac('sha256', secretKey).update(checkString).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(payload.hash, 'hex'));
  } catch {
    return false;
  }
}
