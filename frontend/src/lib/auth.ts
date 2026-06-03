import { api } from './api';
import { normalizePhone } from './phone';

export type StaffUser = {
  id: string;
  email: string;
  phone?: string;
  fullName?: string;
  role: string;
};

export type StaffLoginResponse = {
  accessToken: string;
  user: StaffUser;
};

/** Staff/admin only — authenticates against `users` table via POST /auth/login */
export function buildStaffLoginBody(loginId: string, password: string) {
  const id = loginId.trim();
  if (id.includes('@')) {
    return { email: id.toLowerCase(), password };
  }
  return { phone: normalizePhone(id), password };
}

/** Canonical staff login endpoint (users table, JWT). Never use /customers/login for staff. */
export async function loginStaff(loginId: string, password: string): Promise<StaffLoginResponse> {
  return api<StaffLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(buildStaffLoginBody(loginId, password)),
  });
}

const TOKEN_KEY = 'foodapp_token';
const USER_KEY = 'foodapp_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StaffUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as StaffUser) : null;
}

export function setAuth(token: string, user: StaffUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function dashboardPath(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/admin';
    case 'BUSINESS':
    case 'RESTAURANT_OWNER':
    case 'RESTAURANT_STAFF':
      return '/business';
    case 'COURIER':
      return '/courier';
    default:
      return '/staff/login';
  }
}
