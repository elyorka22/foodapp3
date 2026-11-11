'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Store, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ShopListRow } from '@/components/shops/shop-list-row';
import { storeTypeTitle, useStoresList } from '@/hooks/use-stores-list';
import { useSelectedCity } from '@/hooks/use-selected-city';
import { restaurantPrepMinutes } from '@/lib/restaurant-card-meta';
import { uz } from '@/lib/uz';

type FilterChip = 'all' | 'freeDelivery' | 'fast';

type Props = {
  type: string;
};

/** Vertical shop directory for one marketplace type (flowers, grocery, …). */
export function StoreTypeDirectory({ type }: Props) {
  const title = storeTypeTitle(type);
  const { selectedCity } = useSelectedCity();

  const [chip, setChip] = useState<FilterChip>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredSearch = useDeferredValue(query.trim());

  const storesQuery = useStoresList(type, deferredSearch || null);
  const stores = storesQuery.data?.data ?? [];

  const filtered = useMemo(() => {
    let list = stores.slice();
    if (chip === 'fast') {
      list = list
        .slice()
        .sort((a, b) => restaurantPrepMinutes(a) - restaurantPrepMinutes(b));
    }
    if (chip === 'freeDelivery') {
      list = list.filter((s) => {
        const n = Number(s.minOrderAmount ?? 0);
        return !Number.isFinite(n) || n <= 0;
      });
    }
    return list;
  }, [stores, chip]);

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+8px)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-zinc-100"
            aria-label={uz.back}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-zinc-500">
              {selectedCity?.name ?? uz.cityName}
            </p>
            <h1 className="truncate text-[22px] font-extrabold tracking-tight text-zinc-900">
              {title}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:bg-zinc-100"
            aria-label={uz.searchAria}
          >
            <Search size={22} strokeWidth={2} />
          </button>
        </div>

        {searchOpen ? (
          <label className="mt-2 flex h-11 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3">
            <Search size={18} className="shrink-0 text-zinc-400" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={uz.searchStores}
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-zinc-400"
            />
          </label>
        ) : null}
      </header>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {(
          [
            { id: 'freeDelivery' as const, label: uz.filterFreeDelivery, Icon: null },
            { id: 'fast' as const, label: uz.filterFast, Icon: Zap },
          ] as const
        ).map(({ id, label, Icon }) => {
          const active = chip === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setChip((prev) => (prev === id ? 'all' : id))}
              className={clsx(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition',
                active
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 bg-white text-zinc-700',
              )}
            >
              {Icon ? <Icon size={14} strokeWidth={2.25} /> : null}
              {label}
            </button>
          );
        })}
      </div>

      <section className="mt-3 divide-y divide-zinc-100 px-4">
        {storesQuery.isLoading &&
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3.5 py-2.5">
              <Skeleton className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-[18px] shadow-none" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36 shadow-none" />
                <Skeleton className="h-3 w-48 shadow-none" />
              </div>
            </div>
          ))}

        {storesQuery.isError && (
          <div className="py-6">
            <EmptyState
              icon={Store}
              title={uz.storesLoadError}
              description={
                storesQuery.error instanceof Error
                  ? storesQuery.error.message
                  : uz.checkConnection
              }
              action={
                <Button type="button" size="sm" onClick={() => storesQuery.refetch()}>
                  {uz.retry}
                </Button>
              }
            />
          </div>
        )}

        {!storesQuery.isLoading &&
          !storesQuery.isError &&
          filtered.map((s, i) => (
            <ShopListRow
              key={s.id}
              store={s}
              index={i}
              fromType={type}
              hideTypeLabel
            />
          ))}

        {!storesQuery.isLoading && !storesQuery.isError && filtered.length === 0 && (
          <div className="py-6">
            <EmptyState
              icon={Store}
              title={uz.storesComingSoon}
              description={uz.storesEmptyHint}
            />
          </div>
        )}
      </section>
    </main>
  );
}
