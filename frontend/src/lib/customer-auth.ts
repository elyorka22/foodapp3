import { api } from '@/lib/api';
import { registerCustomerDevice } from '@/lib/device-registration';
import { setCustomerAuth, type CustomerProfile } from '@/lib/customer';

export type CustomerAuthResponse = {
  accessToken: string;
  user: CustomerProfile;
};

export async function requestCustomerOtp(phone: string) {
  return api<{ ok: boolean; retryAfterSeconds: number }>('/customers/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyCustomerOtp(body: {
  phone: string;
  code: string;
  fullName?: string;
}): Promise<CustomerAuthResponse> {
  return api<CustomerAuthResponse>('/customers/otp/verify', {
    method: 'POST',
    body: JSON.stringify(body),
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

export async function updateCustomerName(fullName: string, token: string): Promise<CustomerAuthResponse> {
  return api<CustomerAuthResponse>('/customers/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ fullName }),
  });
}

export function persistCustomerSession(res: CustomerAuthResponse) {
  setCustomerAuth(res.accessToken, res.user);
  void registerCustomerDevice();
}
