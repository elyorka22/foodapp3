/** API base: use relative /api/v1 in browser when behind Nginx (production). */
export function getApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env && env.trim() !== '') return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/api/v1';
  return 'http://localhost:4000/api/v1';
}

export function getWsBase(): string {
  const env = process.env.NEXT_PUBLIC_WS_URL;
  if (env && env.trim() !== '') return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:4000';
}

export async function api<T>(path: string, options?: RequestInit & { token?: string }): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBase()}${path}`, { ...rest, headers });
  if (res.status === 401 && token) {
    const { clearAuth } = await import('./auth');
    clearAuth();
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
    throw new Error(message ?? res.statusText);
  }
  return res.json();
}
