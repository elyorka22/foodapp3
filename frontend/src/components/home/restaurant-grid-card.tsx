'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import { restaurantDeliveryLabel } from '@/lib/restaurant-card-meta';
import { restaurantPublicPath } from '@/lib/restaurant-url';
import { uz } from '@/lib/uz';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const FALLBACK_BACKGROUNDS = [
  'bg-[#FF5A45]',
  'bg-[#EA6A1A]',
  'bg-[#FF8A3D]',
  'bg-[#C2410C]',
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
  const isClosed = restaurant.isOpen === false;

  return (
    <Link href={href} className="group block transition active:scale-[0.98]">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[22px] bg-zinc-200 shadow-sm">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={restaurant.name}
            fill
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            style={coverStyle}
            sizes="(max-width: 430px) 50vw, 210px"
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/45" />
        {isClosed ? <div className="pointer-events-none absolute inset-0 bg-black/40" /> : null}

        <h3 className="absolute left-3 right-3 top-3 line-clamp-2 text-[15px] font-extrabold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">
          {restaurant.name}
        </h3>

        <button
          type="button"
          className="absolute bottom-2.5 left-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
          aria-label={uz.favoritesAria}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart size={17} strokeWidth={2} />
        </button>

        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[#FF6B00] px-2.5 py-1.5 text-[12px] font-extrabold text-white shadow-[0_3px_10px_rgba(255,107,0,0.35)]">
          {delivery}
        </span>
      </div>
    </Link>
  );
}
