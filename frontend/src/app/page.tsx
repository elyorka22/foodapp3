'use client';

import { Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeBannerGrid } from '@/components/home/home-banner-grid';
import { HomeHeadline } from '@/components/home/home-headline';
import { RestaurantGridCard } from '@/components/home/restaurant-grid-card';
import { useHomeBanners, useHomeRestaurants } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

export default function HomePage() {
  const bannersQuery = useHomeBanners();
  const restaurantsQuery = useHomeRestaurants();

  const restaurants = restaurantsQuery.data?.data ?? [];
  const hasError = restaurantsQuery.isError;

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeHeadline />

      <HomeBannerGrid banners={bannersQuery.data ?? []} isLoading={bannersQuery.isLoading} />

      <section className="mt-6" aria-label={uz.restaurants}>
        {restaurantsQuery.isLoading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="aspect-[16/10] w-full rounded-2xl shadow-none" />
                <div className="mt-2.5 space-y-2">
                  <Skeleton className="h-4 w-2/3 rounded-lg shadow-none" />
                  <Skeleton className="h-3 w-full rounded-lg shadow-none" />
                </div>
              </div>
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
          <div className="flex flex-col gap-4">
            {restaurants.map((r, i) => (
              <RestaurantGridCard key={r.id} restaurant={r} index={i} />
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
