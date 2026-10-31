'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUp,
  ChevronLeft,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { RestaurantListCard } from '@/components/restaurants/restaurant-list-card';
import { useDishCategories } from '@/hooks/use-dish-categories';
import { useHomeBanners, useHomeRestaurants } from '@/hooks/use-home-data';
import { useSelectedCity } from '@/hooks/use-selected-city';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import { restaurantPrepMinutes } from '@/lib/restaurant-card-meta';
import { uz } from '@/lib/uz';

type FilterChip = 'all' | 'fast' | 'pickup' | 'promos';

export default function RestaurantsPage() {
  const restaurantsQuery = useHomeRestaurants();
  const categoriesQuery = useDishCategories();
  const bannersQuery = useHomeBanners();
  const { selectedCity } = useSelectedCity();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [chip, setChip] = useState<FilterChip>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const restaurants = restaurantsQuery.data?.data ?? [];
  const categories = (categoriesQuery.data ?? []).filter((c) => c.isActive !== false);

  const promoBanners = useMemo(
    () =>
      (bannersQuery.data ?? [])
        .filter((b) => {
          const p = b.placement ?? 'PROMO';
          return p === 'PROMO' || p === 'HERO';
        })
        .filter((b) => Boolean(resolveImageUrl(b.imageUrl)))
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .slice(0, 8),
    [bannersQuery.data],
  );

  const filtered = useMemo(() => {
    let list = restaurants.slice();
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (activeCategory) {
      list = list.filter((r) =>
        (r.categories ?? r.productCategories ?? []).some(
          (c) => c.slug === activeCategory || c.id === activeCategory,
        ),
      );
      // If API does not attach categories to list items, keep full list
      // rather than showing empty after a cuisine tap.
      if (list.length === 0 && restaurants.every((r) => !(r.categories ?? r.productCategories)?.length)) {
        list = restaurants.slice();
      }
    }
    if (chip === 'fast') {
      list = list
        .slice()
        .sort((a, b) => restaurantPrepMinutes(a) - restaurantPrepMinutes(b));
    }
    return list;
  }, [restaurants, query, activeCategory, chip]);

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
              {uz.restaurants}
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
              placeholder={uz.searchRestaurants}
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-zinc-400"
            />
          </label>
        ) : null}
      </header>

      {/* Cuisine circles */}
      {categories.length > 0 ? (
        <div className="mt-2 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const active = activeCategory === cat.slug;
            const img = resolveImageUrl(cat.imageUrl);
            const framing = categoryImageStyle(cat, { fit: 'contain' });
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setActiveCategory((prev) => (prev === cat.slug ? null : cat.slug))
                }
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
                      {cat.name.charAt(0)}
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
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700"
          aria-label={uz.filters}
        >
          <SlidersHorizontal size={16} strokeWidth={2.25} />
        </button>
        {(
          [
            { id: 'fast' as const, label: uz.filterFast, Icon: Zap },
            { id: 'pickup' as const, label: uz.pickupLabel, Icon: ShoppingBag },
            { id: 'promos' as const, label: uz.filterPromos, Icon: null },
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

      {/* Promo collections */}
      {promoBanners.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-3 px-4 text-[18px] font-extrabold tracking-tight text-zinc-900">
            {uz.discountsAndPicks}
          </h2>
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {promoBanners.map((banner) => {
              const src = resolveImageUrl(banner.imageUrl)!;
              const href = banner.linkUrl?.trim() || '/promotions';
              return (
                <Link
                  key={banner.id}
                  href={href}
                  className="relative h-[8.5rem] w-[8.5rem] shrink-0 overflow-hidden rounded-[18px] bg-zinc-200 active:scale-[0.98]"
                >
                  <Image src={src} alt={banner.title || ''} fill className="object-cover" sizes="136px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  {banner.title?.trim() ? (
                    <p className="absolute bottom-2 left-2 right-2 line-clamp-2 text-[12px] font-bold leading-snug text-white">
                      {banner.title}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-5 space-y-5 px-4">
        {restaurantsQuery.isLoading &&
          [1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[16/10] w-full rounded-[20px] shadow-none" />
              <Skeleton className="h-4 w-40 shadow-none" />
              <Skeleton className="h-3 w-56 shadow-none" />
            </div>
          ))}

        {restaurantsQuery.isError && (
          <EmptyState
            icon={UtensilsCrossed}
            title={uz.restaurantsLoadError}
            description={
              restaurantsQuery.error instanceof Error
                ? restaurantsQuery.error.message
                : uz.checkConnection
            }
            action={
              <Button type="button" size="sm" onClick={() => restaurantsQuery.refetch()}>
                {uz.retry}
              </Button>
            }
          />
        )}

        {!restaurantsQuery.isLoading &&
          !restaurantsQuery.isError &&
          filtered.map((r, i) => (
            <RestaurantListCard key={r.id} restaurant={r} index={i} />
          ))}

        {!restaurantsQuery.isLoading &&
          !restaurantsQuery.isError &&
          filtered.length === 0 && (
            <EmptyState
              icon={UtensilsCrossed}
              title={uz.restaurantsComingSoon}
              description={uz.restaurantsEmptyHint}
            />
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
