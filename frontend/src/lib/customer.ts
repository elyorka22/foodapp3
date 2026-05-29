export type CustomerProfile = {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
};

const PROFILE_KEY = 'foodapp_customer';
const ORDERS_KEY = 'foodapp_tracking_tokens';

export function getCustomer(): CustomerProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as CustomerProfile) : null;
}

export function setCustomer(profile: CustomerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearCustomer() {
  localStorage.removeItem(PROFILE_KEY);
}

export function saveTrackingToken(token: string, orderNumber?: string) {
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
