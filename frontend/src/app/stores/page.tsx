'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Store } from 'lucide-react';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { RestaurantGridCard } from '@/components/home/restaurant-grid-card';
import { shopPublicPath } from '@/lib/shop-url';
import { uz } from '@/lib/uz';
import { storeTypeTitle, useStoresList } from '@/hooks/use-stores-list';
import type { HomeRestaurant } from '@/hooks/use-home-data';
import type { ShopBusiness } from '@/hooks/use-shops-data';

function toGridRestaurant(store: ShopBusiness): HomeRestaurant {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logoUrl: store.logoUrl,
    coverUrl: store.coverUrl,
    coverPositionX: store.coverPositionX,
    coverPositionY: store.coverPositionY,
    coverScale: store.coverScale,
    avgPrepMinutes: store.deliveryMinutes,
    deliveryMinutes: store.deliveryMinutes,
    averageRating: store.averageRating,
    reviewCount: store.reviewCount,
    minOrderAmount: store.minOrderAmount,
    isOpen: store.isOpen,
    closesAt: store.closesAt,
    closingSoon: store.closingSoon,
    minutesUntilClose: store.minutesUntilClose,
  };
}

function StoresPageInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const query = useStoresList(type);
  const stores = query.data?.data ?? [];
  const title = type ? storeTypeTitle(type) : uz.allStores;

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <div className="flex items-center gap-2 py-4">
        <Link href="/" className="rounded-full p-2 active:bg-zinc-200" aria-label={uz.back}>
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>

      {query.isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-[22px] shadow-none" />
          ))}
        </div>
      )}

      {query.isError && (
        <EmptyState
          icon={Store}
          title={uz.storesLoadError}
          description={
            query.error instanceof Error ? query.error.message : uz.checkConnection
          }
          action={
            <Button type="button" size="sm" onClick={() => query.refetch()}>
              {uz.retry}
            </Button>
          }
        />
      )}

      {!query.isLoading && !query.isError && stores.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {stores.map((s, i) => (
            <RestaurantGridCard
              key={s.id}
              restaurant={toGridRestaurant(s)}
              index={i}
              href={shopPublicPath(s)}
            />
          ))}
        </div>
      )}

      {!query.isLoading && !query.isError && stores.length === 0 && (
        <EmptyState
          icon={Store}
          title={uz.storesComingSoon}
          description={uz.storesEmptyHint}
        />
      )}
    </main>
  );
}

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
          <div className="grid grid-cols-2 gap-3 pt-16">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-[22px] shadow-none" />
            ))}
          </div>
        </main>
      }
    >
      <StoresPageInner />
    </Suspense>
  );
}
