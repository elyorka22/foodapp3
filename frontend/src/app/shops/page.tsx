'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Store } from 'lucide-react';
import Link from 'next/link';
import { HomeSearchBar } from '@/components/home/home-search-bar';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { BusinessTypeCard } from '@/components/shops/business-type-card';
import { ShopBusinessCard } from '@/components/shops/shop-business-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  useBusinessTypes,
  useShops,
  type ShopsFilter,
} from '@/hooks/use-shops-data';
import { uz } from '@/lib/uz';

const FILTERS: { id: ShopsFilter; label: string }[] = [
  { id: 'popular', label: uz.filterPopular },
  { id: 'nearest', label: uz.filterNearest },
  { id: 'rating', label: uz.filterRating },
  { id: 'fastest', label: uz.filterFastest },
];

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get('type') ?? '';

  const [search, setSearch] = useState('');
  const [typeSlug, setTypeSlug] = useState(typeFromUrl);
  const [sort, setSort] = useState<ShopsFilter>('popular');

  const typesQuery = useBusinessTypes();
  const shopsQuery = useShops({
    search,
    type: typeSlug || undefined,
    sort,
    limit: 50,
  });

  const types = (typesQuery.data ?? []).filter((t) => t.slug !== 'restaurant');
  const businesses = shopsQuery.data?.data ?? [];

  const popular = useMemo(
    () => [...businesses].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8),
    [businesses],
  );

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
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {types.map((t) => (
              <BusinessTypeCard
                key={t.id}
                type={t}
                active={typeSlug === t.slug}
                onSelect={() => setTypeSlug(typeSlug === t.slug ? '' : t.slug)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSort(f.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              sort === f.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-zinc-600 shadow-sm'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {popular.length > 0 && !shopsQuery.isLoading && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{uz.popularBusinesses}</h2>
            <ChevronRight size={18} className="text-zinc-400" />
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {popular.map((b) => (
              <ShopBusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">{uz.allBusinesses}</h2>

        {shopsQuery.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        )}

        {shopsQuery.isError && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{uz.shopsLoadError}</p>
        )}

        {!shopsQuery.isLoading && !shopsQuery.isError && businesses.length === 0 && (
          <EmptyState icon={Store} title={uz.shopsEmpty} description={uz.shopsEmptyHint} />
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {businesses.map((b) => (
            <ShopBusinessCard key={b.id} business={b} className="w-full shrink" />
          ))}
        </div>
      </section>
    </main>
  );
}
