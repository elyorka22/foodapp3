'use client';

import { Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeCenterHeader } from '@/components/home/home-center-header';
import { HomePromoBanners } from '@/components/home/home-promo-banners';
import { HomeServiceGrid } from '@/components/home/home-service-grid';
import { RestaurantGridCard } from '@/components/home/restaurant-grid-card';
import { SectionHeader } from '@/components/home/section-header';
import { useHomeBanners, useHomeRestaurants } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

export default function HomePage() {
  const bannersQuery = useHomeBanners();
  const restaurantsQuery = useHomeRestaurants();

  const restaurants = restaurantsQuery.data?.data ?? [];
  const hasError = restaurantsQuery.isError;

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-white px-4 pb-8">
      <HomeCenterHeader />
      <HomeServiceGrid />

      <HomePromoBanners
        banners={bannersQuery.data ?? []}
        isLoading={bannersQuery.isLoading}
      />

      <section className="mt-6" aria-label={uz.restaurants}>
        <SectionHeader title={uz.restaurants} href="/restaurants" linkLabel={uz.seeAll} />

        {restaurantsQuery.isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-[22px] shadow-none" />
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
              <RestaurantGridCard
                key={r.id}
                restaurant={r}
                index={i}
                priority={i < 4}
              />
            ))}
          </div>
        )}

        {!restaurantsQuery.isLoading && !hasError && restaurants.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            title={uz.restaurantsComingSoon}
            description={uz.restaurantsEmptyHint}
          />
        )}
      </section>
    </main>
  );
}
