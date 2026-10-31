'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUp,
  ChevronLeft,
  Search,
  Store,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ShopListRow } from '@/components/shops/shop-list-row';
import { useStoreBusinessTypes } from '@/hooks/use-business-types';
import { useStoresList } from '@/hooks/use-stores-list';
import { useSelectedCity } from '@/hooks/use-selected-city';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import { restaurantPrepMinutes } from '@/lib/restaurant-card-meta';
import { uz } from '@/lib/uz';

type Fulfillment = 'delivery' | 'pickup';
type FilterChip = 'all' | 'deliveryDiscount' | 'freeDelivery' | 'fast';

function StoresPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeFromUrl = searchParams.get('type');
  const { selectedCity } = useSelectedCity();
  const typesQuery = useStoreBusinessTypes();

  const [activeType, setActiveType] = useState<string | null>(typeFromUrl);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [chip, setChip] = useState<FilterChip>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setActiveType(typeFromUrl);
  }, [typeFromUrl]);

  const storesQuery = useStoresList(activeType);
  const stores = storesQuery.data?.data ?? [];
  const storeTypes = typesQuery.data ?? [];

  const filtered = useMemo(() => {
    let list = stores.slice();
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
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
  }, [stores, query, chip]);

  const selectType = (slug: string | null) => {
    const next = activeType === slug ? null : slug;
    setActiveType(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('type', next);
    else params.delete('type');
    const qs = params.toString();
    router.replace(qs ? `/stores?${qs}` : '/stores', { scroll: false });
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <h1 className="truncate text-[20px] font-extrabold tracking-tight text-zinc-900">
              {uz.allStores}
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
          <label className="mt-2 flex h-11 items-center gap-2 rounded-2xl bg-zinc-100 px-3">
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

        {/* Delivery / Pickup */}
        <div className="relative mt-3 flex rounded-full bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setFulfillment('delivery')}
            className={clsx(
              'flex-1 rounded-full py-2 text-center text-[13px] font-bold transition',
              fulfillment === 'delivery'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600',
            )}
          >
            {uz.deliveryLabel}
          </button>
          <button
            type="button"
            onClick={() => setFulfillment('pickup')}
            className={clsx(
              'relative flex-1 rounded-full py-2 text-center text-[13px] font-bold transition',
              fulfillment === 'pickup'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600',
            )}
          >
            {uz.pickupLabel}
            <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
              {uz.freeBadge}
            </span>
          </button>
        </div>
      </header>

      {/* Store type circles */}
      {storeTypes.length > 0 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {storeTypes.map((cat) => {
            const active = activeType === cat.slug;
            const img = resolveImageUrl(cat.imageUrl);
            const framing = categoryImageStyle(cat, { fit: 'contain' });
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectType(cat.slug)}
                className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 active:scale-[0.97]"
              >
                <span
                  className={clsx(
                    'relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-zinc-100',
                    active && 'ring-2 ring-brand-600 ring-offset-2',
                  )}
                >
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-contain p-1.5"
                      style={framing}
                      sizes="56px"
                    />
                  ) : (
                    <span className="text-lg font-black text-zinc-500">
                      {cat.icon?.trim() || cat.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-zinc-700">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Filter chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {(
          [
            { id: 'deliveryDiscount' as const, label: uz.filterDeliveryDiscount, Icon: null },
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
                active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700',
              )}
            >
              {Icon ? <Icon size={14} strokeWidth={2.25} /> : null}
              {label}
            </button>
          );
        })}
      </div>

      <section className="mt-4 divide-y divide-zinc-100 px-4">
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
          filtered.map((s, i) => <ShopListRow key={s.id} store={s} index={i} />)}

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

      <button
        type="button"
        onClick={scrollTop}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-800 shadow-[0_6px_20px_rgba(15,23,42,0.15)] active:scale-95"
        aria-label={uz.scrollToTop}
      >
        <ArrowUp size={20} strokeWidth={2.25} />
      </button>
    </main>
  );
}

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <main className="customer-page mx-auto min-h-screen max-w-lg bg-background px-4 pb-24">
          <div className="space-y-3 pt-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3.5">
                <Skeleton className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-[18px] shadow-none" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-36 shadow-none" />
                  <Skeleton className="h-3 w-48 shadow-none" />
                </div>
              </div>
            ))}
          </div>
        </main>
      }
    >
      <StoresPageInner />
    </Suspense>
  );
}
