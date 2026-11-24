'use client';

import { useState } from 'react';
import { Store, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';
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
  const [cityOpen, setCityOpen] = useState(false);

  return (
    <main className="customer-page relative mx-auto min-h-screen max-w-lg bg-background">
      <div
        className={clsx(
          'fixed inset-x-0 top-0 mx-auto max-w-lg px-4',
          cityOpen ? 'z-40' : 'z-10',
        )}
      >
        <HomeCenterHeader onCityOpenChange={setCityOpen} />
      </div>

      <div className="pointer-events-none h-[calc(env(safe-area-inset-top,0px)+58px)]" />

      <section className="relative z-20 min-h-screen rounded-t-[32px] bg-white px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] pt-4">
        <HomeServiceGrid />

        <HomePromoBanners
          banners={bannersQuery.data ?? []}
          isLoading={bannersQuery.isLoading}
        />

        <HomeRestaurantsCarousel
          restaurants={restaurants}
          isLoading={restaurantsQuery.isLoading}
          total={restaurantsTotal}
        />

        <HomeShopsCarousel
          stores={stores}
          isLoading={storesQuery.isLoading}
          total={stores.length}
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
      </section>
    </main>
  );
}
