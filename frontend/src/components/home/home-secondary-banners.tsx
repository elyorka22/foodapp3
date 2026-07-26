'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';
import type { DishCategory } from '@/hooks/use-dish-categories';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { DishCategoryCarousel } from '@/components/home/dish-category-carousel';

type Props = {
  categories: DishCategory[];
  isLoading?: boolean;
};

function AllRestaurantsCard({
  imageUrl,
  title,
}: {
  imageUrl?: string | null;
  title: string;
}) {
  const src = resolveImageUrl(imageUrl);

  return (
    <Link
      href="/restaurants"
      className="flex w-[88px] shrink-0 flex-col active:scale-[0.98]"
      aria-label={title}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[20px] bg-brand-600">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover"
            sizes="88px"
            unoptimized
          />
        ) : null}
      </div>
      <p className="mt-1.5 truncate text-center text-xs font-semibold text-zinc-800">
        {title}
      </p>
    </Link>
  );
}

export function HomeSecondaryBanners({ categories, isLoading }: Props) {
  const settings = usePublicSettings();
  const restaurantsTitle =
    settings.data?.home_restaurants_banner_title?.trim() || uz.allRestaurants;

  if (isLoading) {
    return (
      <section
        className="mt-4 flex h-[112px] gap-2"
        aria-label={uz.homeSecondaryBanners}
      >
        <div className="flex w-[88px] shrink-0 flex-col">
          <Skeleton className="min-h-0 flex-1 rounded-[20px] shadow-none" />
          <Skeleton className="mx-auto mt-1.5 h-3 w-16 rounded shadow-none" />
        </div>
        <div className="flex flex-1 gap-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex w-[88px] shrink-0 flex-col">
              <Skeleton className="min-h-0 flex-1 rounded-[20px] shadow-none" />
              <Skeleton className="mx-auto mt-1.5 h-3 w-14 rounded shadow-none" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-4 flex h-[112px] gap-2"
      aria-label={uz.homeSecondaryBanners}
    >
      <AllRestaurantsCard
        imageUrl={settings.data?.home_restaurants_banner_image_url}
        title={restaurantsTitle}
      />
      <div className="min-w-0 flex-1">
        <DishCategoryCarousel categories={categories} />
      </div>
    </section>
  );
}
