'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { coverObjectPosition } from '@/lib/cover-position';
import { formatSum } from '@/lib/format-sum';
import { restaurantPublicPath } from '@/lib/restaurant-url';
import { uz } from '@/lib/uz';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const FALLBACK_BACKGROUNDS = [
  'bg-[#FF5A45]',
  'bg-[#E91E96]',
  'bg-[#7C5CFF]',
  'bg-[#EA6A1A]',
] as const;

const DEFAULT_MIN_ORDER = 30_000;

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
    restaurant.description?.slice(0, 36) ||
    '';
  const prepMin = restaurant.avgPrepMinutes ?? 25;
  const prep = `${Math.max(15, prepMin - 5)}–${prepMin + 5} ${uz.min}`;
  const minOrder = Number(restaurant.minOrderAmount ?? DEFAULT_MIN_ORDER);
  const freeLine = `• ${uz.freeDeliveryFrom(formatSum(minOrder))}`;
  const href = restaurantPublicPath(restaurant);

  return (
    <Link
      href={href}
      className="relative block aspect-[5/6] overflow-hidden rounded-2xl shadow-none ring-0 transition active:scale-[0.98]"
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

      <span
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-white"
        aria-hidden
      >
        <Heart size={18} strokeWidth={2} />
      </span>

      <div className="absolute inset-x-0 bottom-0 flex flex-col px-2.5 pb-2.5 pt-8">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-tight text-white">{restaurant.name}</h3>
        {tags ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-white/90">{tags}</p>
        ) : null}
        <span className="mt-1.5 inline-flex w-fit rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-900">
          {prep}
        </span>
        <p className="mt-1.5 text-[10px] font-semibold text-[#86EFAC]">{freeLine}</p>
      </div>
    </Link>
  );
}
