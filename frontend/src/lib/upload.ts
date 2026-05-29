import { getApiBase } from '@/lib/api';
import { getToken } from '@/lib/auth';

export async function uploadImage(file: File): Promise<{ url: string }> {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${getApiBase()}/upload/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
    throw new Error(message ?? res.statusText);
  }

  return res.json();
}
