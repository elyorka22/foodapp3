import { api } from '@/lib/api';
import { registerCustomerDevice } from '@/lib/device-registration';
import { setCustomerAuth, type CustomerProfile } from '@/lib/customer';

/**
 * Telegram signed user — platform-agnostic contract shared with backend `TelegramSignedPayload`.
 * Web: Telegram Login Widget. Flutter: `telegram_login` / Telegram SDK callback.
 */
export type TelegramSignedUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export type CustomerAuthResponse = {
  accessToken: string;
  user: CustomerProfile;
};

/** POST /auth/telegram — same endpoint for Web, Flutter, and future mobile apps. */
export async function signInWithTelegram(
  payload: TelegramSignedUser,
): Promise<CustomerAuthResponse> {
  return api<CustomerAuthResponse>('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signInWithPhone(
  phone: string,
  password?: string,
): Promise<CustomerAuthResponse> {
  return api<CustomerAuthResponse>('/customers/login', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      ...(password?.trim() ? { password: password.trim() } : {}),
    }),
  });
}

export async function registerWithPhone(body: {
  phone: string;
  fullName: string;
  email?: string;
  password?: string;
  referredByCode?: string;
}): Promise<CustomerAuthResponse> {
  return api<CustomerAuthResponse>('/customers/register', {
    method: 'POST',
    body: JSON.stringify({
      phone: body.phone,
      fullName: body.fullName,
      ...(body.email ? { email: body.email } : {}),
      ...(body.password?.trim() ? { password: body.password.trim() } : {}),
      ...(body.referredByCode ? { referredByCode: body.referredByCode } : {}),
    }),
  });
}

export function persistCustomerSession(res: CustomerAuthResponse) {
  setCustomerAuth(res.accessToken, res.user);
  void registerCustomerDevice();
}
