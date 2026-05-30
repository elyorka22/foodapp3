'use client';

import Link from 'next/link';
import { ChevronRight, Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { BannerCarousel } from '@/components/home/banner-carousel';
import { DeliveryAddressBar } from '@/components/home/delivery-address-bar';
import { FreeDeliveryPromo } from '@/components/home/free-delivery-promo';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { RestaurantGridCard } from '@/components/home/restaurant-grid-card';
import { useHomeBanners, useHomeRestaurants } from '@/hooks/use-home-data';

export default function HomePage() {
  const bannersQuery = useHomeBanners();
  const restaurantsQuery = useHomeRestaurants();

  const restaurants = restaurantsQuery.data?.data ?? [];
  const banners = bannersQuery.data ?? [];
  const hasError = restaurantsQuery.isError;

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-6">
      <HomeTopBar />
      <DeliveryAddressBar />

      <section className="mt-4" aria-label="Aksiyalar">
        <BannerCarousel banners={banners} isLoading={bannersQuery.isLoading} />
      </section>

      <FreeDeliveryPromo />

      <section className="mt-6" aria-label="Restoranlar">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Restoranlar</h2>
          {restaurants.length > 0 && (
            <Link
              href="/"
              className="flex items-center gap-0.5 text-sm font-semibold text-brand-600 active:opacity-70"
            >
              Barchasi
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {restaurantsQuery.isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[168px] rounded-3xl" />
            ))}
          </div>
        )}

        {hasError && (
          <EmptyState
            icon={Store}
            title="Restoranlar yuklanmadi"
            description={
              restaurantsQuery.error instanceof Error
                ? restaurantsQuery.error.message
                : "Internet aloqasini tekshiring"
            }
            action={
              <Button type="button" size="sm" onClick={() => restaurantsQuery.refetch()}>
                Qayta urinish
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
            title="Tez orada restoranlar"
            description="Hozircha ro'yxat bo'sh. Admin panelda restoranlarni faollashtiring va tasdiqlang."
          />
        )}
      </section>
    </main>
  );
}
