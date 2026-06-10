'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
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

function DishCategorySlide({ category }: { category: DishCategory }) {
  const imageUrl = resolveImageUrl(category.imageUrl);
  const href = `/categories/${encodeURIComponent(category.slug)}`;

  return (
    <Link href={href} className="block h-full active:scale-[0.98]">
      <div className="relative h-full min-h-[120px] overflow-hidden rounded-3xl bg-zinc-200 shadow-card">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            className="h-full w-full object-cover"
            style={categoryImageStyle(category)}
            sizes="50vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-orange-400 px-3 text-center">
            <span className="text-sm font-bold text-white">{category.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <p className="absolute bottom-3 left-3 right-3 text-sm font-bold leading-snug text-white drop-shadow-sm">
          {category.name}
        </p>
      </div>
    </Link>
  );
}

function DishCategoriesBanner({ categories }: { categories: DishCategory[] }) {
  const [index, setIndex] = useState(0);
  const slides = categories.filter((c) => c.isActive !== false);

  const advance = useCallback(() => {
    if (slides.length <= 1) return;
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance, slides.length]);

  useEffect(() => {
    setIndex(0);
  }, [slides.length, slides[0]?.id]);

  if (!slides.length) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-50 to-orange-100 px-3 text-center">
        <span className="text-sm font-semibold text-brand-800">{uz.dishCategories}</span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[120px]">
      <DishCategorySlide category={slides[index]} />
      {slides.length > 1 ? (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={uz.slide(i + 1)}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
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
  const href = '/restaurants';

  const inner = (
    <div className="relative h-full min-h-[120px] overflow-hidden rounded-3xl bg-zinc-200 shadow-card">
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          className="h-full w-full object-cover"
          sizes="50vw"
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-3 text-center">
          <span className="text-sm font-semibold text-emerald-800">{title}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <p className="absolute bottom-3 left-3 right-3 text-sm font-bold leading-snug text-white drop-shadow-sm">
        {title}
      </p>
    </div>
  );

  return (
    <Link href={href} className="block h-full active:scale-[0.98]">
      {inner}
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
        <Skeleton className="min-h-[120px] rounded-3xl shadow-none" />
        <Skeleton className="min-h-[120px] rounded-3xl shadow-none" />
      </section>
    );
  }

  return (
    <section className="mt-4 grid grid-cols-2 gap-3" aria-label={uz.homeSecondaryBanners}>
      <DishCategoriesBanner categories={categories} />
      <AllRestaurantsBanner
        imageUrl={settings.data?.home_restaurants_banner_image_url}
        title={restaurantsTitle}
      />
    </section>
  );
}
