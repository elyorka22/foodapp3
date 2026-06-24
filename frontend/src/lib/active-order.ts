const ACTIVE_ORDER_KEY = 'foodapp_active_order';

export type ActiveOrderRef = {
  token: string;
  orderNumber?: string;
  savedAt: string;
};

const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELLED']);

export function isActiveOrderStatus(status: string): boolean {
  return !TERMINAL_STATUSES.has(status);
}

export function setActiveOrderToken(token: string, orderNumber?: string) {
  if (typeof window === 'undefined') return;
  const payload: ActiveOrderRef = {
    token,
    orderNumber,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(payload));
}

export function getActiveOrderToken(): ActiveOrderRef | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ACTIVE_ORDER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveOrderRef;
  } catch {
    return null;
  }
}

export function clearActiveOrderToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_ORDER_KEY);
}
