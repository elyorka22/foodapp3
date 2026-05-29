export type StaffUser = {
  id: string;
  email: string;
  phone?: string;
  fullName?: string;
  role: string;
};

/** Staff login: use email (admin@...) OR phone from users table — NOT customer registration phone */
export function buildStaffLoginBody(loginId: string, password: string) {
  const id = loginId.trim();
  if (id.includes('@')) {
    return { email: id.toLowerCase(), password };
  }
  return { phone: id, password };
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
      return '/manager';
    case 'RESTAURANT_OWNER':
    case 'RESTAURANT_STAFF':
      return '/restaurant';
    case 'COURIER':
      return '/courier';
    default:
      return '/login';
  }
}
