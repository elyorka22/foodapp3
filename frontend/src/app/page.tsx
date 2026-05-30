'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { BannerCarousel } from '@/components/home/banner-carousel';
import { HomeSearchBar } from '@/components/home/home-search-bar';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { PromoBanner } from '@/components/home/promo-banner';
import { RestaurantGridCard } from '@/components/home/restaurant-grid-card';
import { useHomeBanners, useHomeRestaurants } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

export default function HomePage() {
  const [search, setSearch] = useState('');

  const bannersQuery = useHomeBanners();
  const restaurantsQuery = useHomeRestaurants();

  const heroBanners = useMemo(
    () => (bannersQuery.data ?? []).filter((b) => (b.placement ?? 'HERO') === 'HERO'),
    [bannersQuery.data],
  );
  const promoBanners = useMemo(
    () => (bannersQuery.data ?? []).filter((b) => b.placement === 'PROMO'),
    [bannersQuery.data],
  );

  const restaurants = useMemo(() => {
    const list = restaurantsQuery.data?.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.categories?.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [restaurantsQuery.data?.data, search]);

  const hasError = restaurantsQuery.isError;

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeTopBar />
      <HomeSearchBar value={search} onChange={setSearch} />

      {heroBanners.length > 0 || bannersQuery.isLoading ? (
        <section className="mt-5" aria-label="Asosiy banner">
          <BannerCarousel banners={heroBanners} isLoading={bannersQuery.isLoading} />
        </section>
      ) : null}

      <PromoBanner banners={promoBanners} isLoading={bannersQuery.isLoading} />

      <section className="mt-6" aria-label={uz.restaurants}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">{uz.restaurants}</h2>
          {restaurants.length > 0 && (
            <Link
              href="/"
              className="flex items-center gap-0.5 text-sm font-semibold text-brand-600 active:opacity-70"
            >
              {uz.seeAll}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {restaurantsQuery.isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        )}

        {hasError && (
          <EmptyState
            icon={Store}
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

        {!restaurantsQuery.isLoading && !hasError && restaurants.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {restaurants.map((r, i) => (
              <RestaurantGridCard key={r.id} restaurant={r} index={i} />
            ))}
          </div>
        )}

        {!restaurantsQuery.isLoading && !hasError && restaurants.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            title={search ? uz.noResults : uz.restaurantsComingSoon}
            description={search ? uz.tryOtherSearch : uz.restaurantsEmptyHint}
          />
        )}
      </section>
    </main>
  );
}
