'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Restaurant = { id: string; name: string; slug: string; description?: string; logoUrl?: string };

export default function HomePage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => api<{ data: Restaurant[] }>('/restaurants?limit=20'),
    retry: 2,
  });

  return (
    <main className="mx-auto max-w-lg px-4 pb-6 pt-4">
      <p className="text-sm opacity-70">Order without signup — or save your phone in Profile</p>

      <section className="mt-4">
        <h2 className="mb-3 text-lg font-semibold">Restaurants</h2>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-black/5 dark:bg-white/10" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Could not load restaurants
            </p>
            <p className="mt-1 text-xs opacity-80">
              {error instanceof Error ? error.message : 'Check API connection'}
            </p>
            <Button type="button" size="sm" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && !data?.data?.length && (
          <p className="text-sm opacity-60">
            No restaurants yet. Run database seed on the server.
          </p>
        )}

        <ul className="space-y-3">
          {data?.data?.map((r) => (
            <li key={r.id}>
              <Link
                href={`/restaurants/${r.slug}`}
                className="block rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:border-brand-500 dark:border-white/10 dark:bg-zinc-900"
              >
                <h3 className="font-semibold">{r.name}</h3>
                {r.description && (
                  <p className="mt-1 text-sm opacity-70 line-clamp-2">{r.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
