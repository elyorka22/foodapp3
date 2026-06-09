import { restaurantPublicPath } from '@/lib/restaurant-url';
import { SITE_URL } from '@/lib/seo';

type RestaurantRow = { id: string; slug?: string | null };
type DishCategoryRow = { slug: string };
type BusinessRow = { slug?: string | null; id: string };

function apiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) return env.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') return `${SITE_URL}/api/v1`;
  return 'http://localhost:4000/api/v1';
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getSitemapPaths(): Promise<string[]> {
  const staticPaths = [
    '/',
    '/shops',
    '/profile',
    '/auth/login',
    '/auth/register',
    '/privacy',
    '/terms',
    '/promotions',
    '/favorites',
  ];

  const restaurantsRes = await fetchJson<{ data: RestaurantRow[] }>('/restaurants?limit=500');
  const restaurantPaths = (restaurantsRes?.data ?? []).map((r) => restaurantPublicPath(r));

  const categoriesRes = await fetchJson<DishCategoryRow[]>('/dish-categories');
  const categoryPaths = (categoriesRes ?? [])
    .filter((c) => c.slug?.trim())
    .map((c) => `/categories/${encodeURIComponent(c.slug)}`);

  const businessesRes = await fetchJson<{ data: BusinessRow[] }>('/businesses?limit=200&vertical=store');
  const shopPaths = (businessesRes?.data ?? []).flatMap((b) => {
    const slug = b.slug?.trim();
    if (slug) return [`/shops/${encodeURIComponent(slug)}`];
    return [`/shops/${b.id}`];
  });

  return [...new Set([...staticPaths, ...restaurantPaths, ...categoryPaths, ...shopPaths])];
}
