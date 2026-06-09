import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

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
  let title = `Kategoriya | FoodApp`;
  let description = 'FoodApp kategoriyasi bo‘yicha taomlar va restoranlar.';

  try {
    const res = await fetch(`${apiBase()}/dish-categories/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as { name?: string; description?: string | null };
      if (data.name?.trim()) title = `${data.name.trim()} | FoodApp`;
      if (data.description?.trim()) description = data.description.trim();
    }
  } catch {
    // fallback metadata
  }

  return buildPageMetadata({
    title,
    description,
    path: `/categories/${slug}`,
  });
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
