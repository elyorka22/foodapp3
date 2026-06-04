'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Footprints } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import {
  restaurantCategoryLabel,
  restaurantDeliveryLabel,
} from '@/lib/restaurant-card-meta';
import { restaurantPublicPath } from '@/lib/restaurant-url';
import { uz } from '@/lib/uz';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const FALLBACK_BACKGROUNDS = [
  'bg-[#FF5A45]',
  'bg-[#E91E96]',
  'bg-[#7C5CFF]',
  'bg-[#EA6A1A]',
] as const;

type Props = {
  restaurant: HomeRestaurant;
  index: number;
};

export function RestaurantGridCard({ restaurant, index }: Props) {
  const imageUrl = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
  const coverStyle = categoryImageStyle({
    imageScale: restaurant.coverScale,
    imagePositionX: restaurant.coverPositionX,
    imagePositionY: restaurant.coverPositionY,
  });
  const href = restaurantPublicPath(restaurant);
  const delivery = restaurantDeliveryLabel(restaurant);
  const categories = restaurantCategoryLabel(restaurant);
  const showGalleryDots = Boolean(restaurant.coverUrl && restaurant.logoUrl);

  return (
    <Link href={href} className="block transition active:scale-[0.99]">
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-zinc-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={restaurant.name}
            fill
            className="h-full w-full"
            style={coverStyle}
            sizes="(max-width: 430px) 100vw, 430px"
            unoptimized
          />
        ) : (
          <div
            className={clsx(
              'absolute inset-0 flex items-center justify-center',
              FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length],
            )}
          >
            <span className="text-5xl font-black text-white/40">{restaurant.name.charAt(0)}</span>
          </div>
        )}

        <button
          type="button"
          className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-sm"
          aria-label={uz.favoritesAria}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Bookmark size={17} strokeWidth={2} />
        </button>

        {showGalleryDots ? (
          <span
            className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-black/45 px-2 py-1"
            aria-hidden
          >
            <span className="h-1 w-1 rounded-full bg-white" />
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <span className="h-1 w-1 rounded-full bg-white/50" />
          </span>
        ) : null}
      </div>

      <div className="mt-1.5">
        <h3 className="truncate text-[15px] font-bold leading-tight text-zinc-900">
          {restaurant.name}
        </h3>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="inline-flex shrink-0 items-center gap-1 text-[13px] text-zinc-500">
            <Footprints size={15} strokeWidth={2} className="text-zinc-600" />
            {delivery}
          </span>
          {categories ? (
            <p className="min-w-0 truncate text-right text-[13px] text-zinc-400">{categories}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
