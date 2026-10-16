import { api } from '@/lib/api';
import { registerCustomerDevice } from '@/lib/device-registration';
import { setCustomerAuth, type CustomerProfile } from '@/lib/customer';
import { obtainGoogleIdToken } from '@/lib/firebase';

export type CustomerAuthResponse = {
  accessToken: string;
  user: CustomerProfile;
};

/** POST /auth/google — Firebase ID token from Google Sign-In. */
export async function signInWithGoogle(): Promise<CustomerAuthResponse> {
  const idToken = await obtainGoogleIdToken();
  return api<CustomerAuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
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
