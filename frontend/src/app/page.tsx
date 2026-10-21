'use client';

import { Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { HomeCenterHeader } from '@/components/home/home-center-header';
import { HomePromoBanners } from '@/components/home/home-promo-banners';
import { HomeRestaurantsCarousel } from '@/components/home/home-restaurants-carousel';
import { HomeServiceGrid } from '@/components/home/home-service-grid';
import { HomeShopsCarousel } from '@/components/home/home-shops-carousel';
import { useHomeBanners, useHomeFeaturedStores, useHomeRestaurants } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

export default function HomePage() {
  const bannersQuery = useHomeBanners();
  const restaurantsQuery = useHomeRestaurants();
  const storesQuery = useHomeFeaturedStores();

  const restaurants = restaurantsQuery.data?.data ?? [];
  const restaurantsTotal =
    restaurantsQuery.data?.meta?.total ?? restaurants.length;
  const stores = storesQuery.data ?? [];
  const hasRestaurantError = restaurantsQuery.isError;
  const showRestaurantEmpty =
    !restaurantsQuery.isLoading &&
    !hasRestaurantError &&
    restaurants.length === 0;

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-background px-4 pb-8">
      <HomeCenterHeader />
      <HomeServiceGrid />

      <HomePromoBanners
        banners={bannersQuery.data ?? []}
        isLoading={bannersQuery.isLoading}
      />

      <HomeShopsCarousel
        stores={stores}
        isLoading={storesQuery.isLoading}
        total={stores.length}
      />

      <HomeRestaurantsCarousel
        restaurants={restaurants}
        isLoading={restaurantsQuery.isLoading}
        total={restaurantsTotal}
      />

      {hasRestaurantError && (
        <div className="mt-4">
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
        </div>
      )}

      {showRestaurantEmpty && (
        <div className="mt-4">
          <EmptyState
            icon={UtensilsCrossed}
            title={uz.restaurantsComingSoon}
            description={uz.restaurantsEmptyHint}
          />
        </div>
      )}
    </main>
  );
}
