'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Store } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { useBusinessTypes } from '@/hooks/use-business-types';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import {
  resolveHomeServiceImageUrl,
  type HomeServiceCardLayout,
} from '@/lib/home-service-cards';
import { homeHrefForType, layoutForBusinessType } from '@/lib/home-service-type';
import { uz } from '@/lib/uz';

function CategoryCard({
  name,
  href,
  layout,
}: {
  name: string;
  href: string;
  layout: HomeServiceCardLayout;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(layout.imageUrl) && !imageFailed;

  return (
    <Link
      href={href}
      className="relative flex aspect-square flex-col overflow-hidden rounded-[22px] bg-[#F3EEFF] p-3 transition active:scale-[0.98]"
    >
      <p className="relative z-10 line-clamp-2 pr-1 text-[13px] font-bold leading-tight text-zinc-900">
        {name}
      </p>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote or static asset
        <img
          src={resolveHomeServiceImageUrl(layout.imageUrl)}
          alt=""
          className="pointer-events-none absolute bottom-1 right-1 h-[62%] w-[72%] object-contain"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="mt-auto flex h-12 w-12 items-center justify-center self-end rounded-full bg-white/80 text-zinc-700">
          <Store size={22} strokeWidth={1.75} />
        </span>
      )}
    </Link>
  );
}

export default function CategoriesPage() {
  const { data: settings } = usePublicSettings();
  const { data: types = [], isLoading, isError, error, refetch } = useBusinessTypes();
  const cards = settings?.home_service_cards;
  const sorted = [...types].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-white px-4 pb-24">
      <header className="sticky top-0 z-30 -mx-4 bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+8px)] backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          <Link
            href="/"
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full active:bg-zinc-100"
            aria-label={uz.back}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </Link>
          <h1 className="px-12 text-center text-[17px] font-extrabold tracking-tight text-zinc-900">
            {uz.storeAllCategories}
          </h1>
        </div>
      </header>

      {isLoading ? (
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-[22px] shadow-none" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            icon={Store}
            title={uz.restaurantsLoadError}
            description={error instanceof Error ? error.message : uz.checkConnection}
            action={
              <Button type="button" size="sm" onClick={() => refetch()}>
                {uz.retry}
              </Button>
            }
          />
        </div>
      ) : sorted.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Store}
            title={uz.categories}
            description={uz.storesComingSoon}
          />
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-3 gap-2.5">
          {sorted.map((type) => (
            <CategoryCard
              key={type.id}
              name={type.name}
              href={homeHrefForType(type)}
              layout={layoutForBusinessType(type, cards)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
