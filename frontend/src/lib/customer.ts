import { setActiveOrderToken } from '@/lib/active-order';

export type CustomerProfile = {
  id: string;
  phone?: string;
  fullName: string;
  email?: string;
  referralCode?: string;
  loyalty?: { points: number; level: string };
  telegramId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramPhotoUrl?: string;
  authProvider?: 'TELEGRAM' | 'PHONE' | 'LOCAL' | 'GOOGLE';
  isTelegramVerified?: boolean;
  lastTelegramLoginAt?: string;
  googleId?: string;
  googlePhotoUrl?: string;
  isGoogleVerified?: boolean;
  lastGoogleLoginAt?: string;
  needsPhone?: boolean;
  defaultDeliveryAddress?: string;
};

const PROFILE_KEY = 'foodapp_customer';
const TOKEN_KEY = 'foodapp_customer_token';
const ORDERS_KEY = 'foodapp_tracking_tokens';

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCustomer(): CustomerProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as CustomerProfile) : null;
}

export function setCustomerAuth(accessToken: string, user: CustomerProfile) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
}

/** @deprecated Use setCustomerAuth — kept for legacy callers */
export function setCustomer(profile: CustomerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearCustomer() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export async function clearCustomerSession() {
  const { unregisterCustomerDevice } = await import('@/lib/device-registration');
  await unregisterCustomerDevice().catch(() => {});
  clearCustomer();
}

export function isCustomerLoggedIn(): boolean {
  return !!getCustomerToken() && !!getCustomer();
}

export function customerNeedsPhone(): boolean {
  const c = getCustomer();
  return !!c && (!c.phone || c.needsPhone === true);
}

export function saveTrackingToken(token: string, orderNumber?: string) {
  setActiveOrderToken(token, orderNumber);
  const list = getTrackingHistory();
  if (list.some((o) => o.token === token)) return;
  list.unshift({ token, orderNumber, savedAt: new Date().toISOString() });
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, 20)));
}

export function getTrackingHistory(): { token: string; orderNumber?: string; savedAt: string }[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ORDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}
