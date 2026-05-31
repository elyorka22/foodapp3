'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { coverObjectPosition } from '@/lib/cover-position';
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
  const objectPosition = coverObjectPosition(
    restaurant.coverPositionX,
    restaurant.coverPositionY,
  );
  const tags =
    restaurant.categories?.map((c) => c.name).join(', ') ||
    restaurant.description?.slice(0, 40) ||
    '';
  const prepMin = restaurant.avgPrepMinutes ?? 25;
  const prep = `${Math.max(15, prepMin - 5)}–${prepMin + 5} ${uz.min}`;
  const href = restaurantPublicPath(restaurant);

  return (
    <Link
      href={href}
      className="relative block aspect-[6/5] overflow-hidden rounded-2xl shadow-none ring-0 drop-shadow-none transition active:scale-[0.98]"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={restaurant.name}
          fill
          className="object-cover brightness-105 saturate-[1.06] contrast-[1.02]"
          style={{ objectPosition }}
          sizes="(max-width: 430px) 50vw, 200px"
          unoptimized
        />
      ) : (
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center',
            FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length],
          )}
        >
          <span className="text-5xl font-black text-white/35">{restaurant.name.charAt(0)}</span>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-black/35 to-transparent"
        aria-hidden
      />

      <span
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-white"
        aria-hidden
      >
        <Heart size={18} strokeWidth={2} />
      </span>

      <div className="absolute left-2 right-10 top-9">
        <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-white">{restaurant.name}</h3>
        {tags ? (
          <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-snug text-white/90">{tags}</p>
        ) : null}
      </div>

      <span className="absolute bottom-2 left-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-900">
        {prep}
      </span>
    </Link>
  );
}
