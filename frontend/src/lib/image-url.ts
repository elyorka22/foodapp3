/** Normalize image URLs from API (Spaces CDN, absolute, or legacy /uploads paths). */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (typeof window !== 'undefined') {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ?? '';
    if (base) return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api/v1';
  const origin = api.replace(/\/api\/v1$/, '');
  return `${origin}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}
