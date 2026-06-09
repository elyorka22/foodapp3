import type { Metadata } from 'next';
import { buildPageMetadata, SITE_NAME } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string }>;
};

function apiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) return env.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') return 'https://foodapp.uz/api/v1';
  return 'http://localhost:4000/api/v1';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let title = `Restoran | ${SITE_NAME}`;
  let description = 'Restoran menyusi va yetkazib berish FoodApp orqali.';

  try {
    const res = await fetch(`${apiBase()}/restaurants/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { name?: string; description?: string | null };
      if (data.name?.trim()) title = `${data.name.trim()} | ${SITE_NAME}`;
      if (data.description?.trim()) description = data.description.trim();
    }
  } catch {
    // fallback metadata
  }

  return buildPageMetadata({
    title,
    description,
    path: `/restaurants/${slug}`,
  });
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
