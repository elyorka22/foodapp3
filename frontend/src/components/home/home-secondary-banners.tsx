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
      className="relative block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[20px] active:scale-[0.98]"
      aria-label={title}
    >
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="88px"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-brand-600" />
      )}
      <span className="absolute left-2 right-2 top-2 line-clamp-2 text-[12px] font-extrabold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">
        {title}
      </span>
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
        className="mt-4 flex h-[88px] items-center gap-2"
        aria-label={uz.homeSecondaryBanners}
      >
        <Skeleton className="h-[88px] w-[88px] shrink-0 rounded-[20px] shadow-none" />
        <div className="flex flex-1 gap-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full shadow-none" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-4 flex h-[88px] items-center gap-2"
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
