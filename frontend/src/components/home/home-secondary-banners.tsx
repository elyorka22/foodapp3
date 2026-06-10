'use client';

import { type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';
import type { DishCategory } from '@/hooks/use-dish-categories';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  categories: DishCategory[];
  isLoading?: boolean;
};

function BannerImage({
  src,
  alt,
  imageStyle,
  fallback,
}: {
  src?: string | null;
  alt: string;
  imageStyle?: CSSProperties;
  fallback: ReactNode;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-zinc-200 shadow-card">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="h-full w-full object-cover"
          style={imageStyle}
          sizes="50vw"
          unoptimized
          draggable={false}
        />
      ) : (
        fallback
      )}
    </div>
  );
}

function DishCategorySlide({ category }: { category: DishCategory }) {
  const imageUrl = resolveImageUrl(category.imageUrl);
  const href = `/categories/${encodeURIComponent(category.slug)}`;

  return (
    <Link
      href={href}
      className="block min-w-full shrink-0 grow-0 snap-center snap-always active:scale-[0.98]"
      aria-label={category.name}
    >
      <BannerImage
        src={imageUrl}
        alt={category.name}
        imageStyle={categoryImageStyle(category)}
        fallback={
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-orange-400 px-3 text-center">
            <span className="text-sm font-bold text-white">{category.name}</span>
          </div>
        }
      />
      <p className="mt-1.5 truncate text-center text-xs font-medium text-zinc-800">
        {category.name}
      </p>
    </Link>
  );
}

function DishCategoriesBanner({ categories }: { categories: DishCategory[] }) {
  const slides = categories.filter((c) => c.isActive !== false);

  if (!slides.length) {
    return (
      <div>
        <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-50 to-orange-100 px-3 text-center shadow-card">
          <span className="text-sm font-semibold text-brand-800">{uz.dishCategories}</span>
        </div>
        <p className="mt-1.5 truncate text-center text-xs font-medium text-zinc-800">
          {uz.dishCategories}
        </p>
      </div>
    );
  }

  if (slides.length === 1) {
    return <DishCategorySlide category={slides[0]} />;
  }

  return (
    <div
      className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
      aria-label={uz.dishCategories}
    >
      {slides.map((category) => (
        <DishCategorySlide key={category.id} category={category} />
      ))}
    </div>
  );
}

function AllRestaurantsBanner({
  imageUrl,
  title,
}: {
  imageUrl?: string | null;
  title: string;
}) {
  const src = resolveImageUrl(imageUrl);

  return (
    <Link href="/restaurants" className="block active:scale-[0.98]">
      <BannerImage
        src={src}
        alt={title}
        fallback={
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-3 text-center">
            <span className="text-sm font-semibold text-emerald-800">{title}</span>
          </div>
        }
      />
      <p className="mt-1.5 truncate text-center text-xs font-medium text-zinc-800">{title}</p>
    </Link>
  );
}

export function HomeSecondaryBanners({ categories, isLoading }: Props) {
  const settings = usePublicSettings();
  const restaurantsTitle =
    settings.data?.home_restaurants_banner_title?.trim() || uz.allRestaurants;

  if (isLoading) {
    return (
      <section className="mt-4 grid grid-cols-2 gap-3" aria-label={uz.homeSecondaryBanners}>
        <div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl shadow-none" />
          <Skeleton className="mx-auto mt-1.5 h-3 w-2/3 rounded shadow-none" />
        </div>
        <div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl shadow-none" />
          <Skeleton className="mx-auto mt-1.5 h-3 w-2/3 rounded shadow-none" />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4 grid grid-cols-2 gap-3" aria-label={uz.homeSecondaryBanners}>
      <AllRestaurantsBanner
        imageUrl={settings.data?.home_restaurants_banner_image_url}
        title={restaurantsTitle}
      />
      <DishCategoriesBanner categories={categories} />
    </section>
  );
}
