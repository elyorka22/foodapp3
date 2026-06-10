'use client';

import Link from 'next/link';
import { ChevronLeft, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { RestaurantGridCard } from '@/components/home/restaurant-grid-card';
import { useHomeRestaurants } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

export default function RestaurantsPage() {
  const restaurantsQuery = useHomeRestaurants();
  const restaurants = restaurantsQuery.data?.data ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <div className="flex items-center gap-2 py-4">
        <Link href="/" className="rounded-full p-2 active:bg-zinc-200" aria-label={uz.back}>
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold">{uz.allRestaurants}</h1>
      </div>

      {restaurantsQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[2/1] w-full rounded-xl shadow-none" />
          ))}
        </div>
      )}

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

      {!restaurantsQuery.isLoading && !restaurantsQuery.isError && restaurants.length > 0 && (
        <div className="flex flex-col gap-3">
          {restaurants.map((r, i) => (
            <RestaurantGridCard key={r.id} restaurant={r} index={i} />
          ))}
        </div>
      )}

      {!restaurantsQuery.isLoading && !restaurantsQuery.isError && restaurants.length === 0 && (
        <EmptyState
          icon={UtensilsCrossed}
          title={uz.restaurantsComingSoon}
          description={uz.restaurantsEmptyHint}
        />
      )}
    </main>
  );
}
