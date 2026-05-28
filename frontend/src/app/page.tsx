'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/theme-toggle';

type Restaurant = { id: string; name: string; slug: string; description?: string; logoUrl?: string };

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => api<{ data: Restaurant[] }>('/restaurants?limit=20'),
  });

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-600">FoodApp</h1>
          <p className="text-sm opacity-70">Order without signup</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-xs text-brand-600">
            Staff
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Restaurants</h2>
        {isLoading && <p className="text-sm opacity-60">Loading...</p>}
        <ul className="space-y-3">
          {data?.data?.map((r) => (
            <li key={r.id}>
              <Link
                href={`/restaurants/${r.slug}`}
                className="block rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:border-brand-500 dark:border-white/10 dark:bg-zinc-900"
              >
                <h3 className="font-semibold">{r.name}</h3>
                {r.description && <p className="mt-1 text-sm opacity-70 line-clamp-2">{r.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
