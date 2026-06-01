'use client';

import { useMemo, useState } from 'react';
import { HomeSearchBar } from '@/components/home/home-search-bar';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { BusinessTypeCard } from '@/components/shops/business-type-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessTypes } from '@/hooks/use-shops-data';
import { uz } from '@/lib/uz';

export default function ShopsClient() {
  const [search, setSearch] = useState('');
  const typesQuery = useBusinessTypes();

  const types = useMemo(() => {
    const list = (typesQuery.data ?? []).filter((t) => t.slug !== 'restaurant');
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q),
    );
  }, [typesQuery.data, search]);

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeTopBar />
      <h1 className="mt-4 text-xl font-bold text-zinc-900">{uz.shopsTitle}</h1>
      <p className="text-sm text-zinc-500">{uz.shopsSubtitle}</p>

      <div className="mt-4">
        <HomeSearchBar
          value={search}
          onChange={setSearch}
          placeholder={uz.shopsSearchPlaceholder}
        />
      </div>

      <section className="mt-6" aria-label={uz.categories}>
        {typesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : types.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
            {search.trim() ? uz.shopsEmpty : uz.shopsEmptyHint}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {types.map((t) => (
              <BusinessTypeCard key={t.id} type={t} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
