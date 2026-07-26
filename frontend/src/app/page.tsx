'use client';

import { Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeBannerGrid } from '@/components/home/home-banner-grid';
import { HomeHeadline } from '@/components/home/home-headline';
import { HomeSecondaryBanners } from '@/components/home/home-secondary-banners';
import { RestaurantGridCard } from '@/components/home/restaurant-grid-card';
import { useDishCategories } from '@/hooks/use-dish-categories';
import { useHomeBanners, useHomeFeaturedStores, useHomeRestaurants } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

export default function HomePage() {
  const bannersQuery = useHomeBanners();
  const storesQuery = useHomeFeaturedStores();
  const restaurantsQuery = useHomeRestaurants();
  const categoriesQuery = useDishCategories();

  const restaurants = restaurantsQuery.data?.data ?? [];
  const hasError = restaurantsQuery.isError;

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeHeadline />

      <HomeBannerGrid
        banners={bannersQuery.data ?? []}
        featuredStores={storesQuery.data}
        isLoading={bannersQuery.isLoading || storesQuery.isLoading}
      />

      <HomeSecondaryBanners
        categories={categoriesQuery.data ?? []}
        isLoading={categoriesQuery.isLoading}
      />

      <section className="mt-6" aria-label={uz.restaurants}>
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
