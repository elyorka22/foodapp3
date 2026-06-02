/**
 * Signed Telegram user data — same shape from Login Widget, Telegram SDK (Flutter/iOS/Android),
 * or any client that obtains an HMAC-signed user object from Telegram.
 * @see https://core.telegram.org/widgets/login#checking-authorization
 */
export type TelegramSignedPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

/** Normalized user after server-side signature verification. Safe to persist. */
export type VerifiedTelegramUser = {
  telegramId: bigint;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate: number;
};

export type CustomerAuthResult = {
  accessToken: string;
  user: Record<string, unknown>;
};
