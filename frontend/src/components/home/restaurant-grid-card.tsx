'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { coverObjectPosition } from '@/lib/cover-position';
import { formatSum } from '@/lib/format-sum';
import { restaurantPublicPath } from '@/lib/restaurant-url';
import { uz } from '@/lib/uz';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const CARD_BACKGROUNDS = [
  'bg-[#FF5A45]',
  'bg-[#E91E96]',
  'bg-[#7C5CFF]',
  'bg-[#EA6A1A]',
] as const;

const DEFAULT_MIN_ORDER = 30_000;

function displayRating(id: string): string {
  const n = id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (4.5 + (n % 5) * 0.1).toFixed(1);
}

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
      className={clsx(
        'relative block aspect-[5/6] overflow-hidden rounded-2xl transition active:scale-[0.98]',
        CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length],
      )}
    >
      {imageUrl ? (
        <div className="pointer-events-none absolute bottom-0 right-0 h-[78%] w-[62%]">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-contain object-bottom-right"
            style={{ objectPosition }}
            sizes="(max-width: 430px) 45vw, 180px"
            unoptimized
          />
        </div>
      ) : (
        <div className="pointer-events-none absolute bottom-2 right-2 text-5xl font-black text-white/20">
          {restaurant.name.charAt(0)}
        </div>
      )}

      <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-lg bg-[#FFD54A] px-1.5 py-0.5 text-[11px] font-bold text-zinc-900 shadow-none">
        <Star size={11} className="fill-amber-600 text-amber-600" />
        {displayRating(restaurant.id)}
      </span>

      <span
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-white"
        aria-hidden
      >
        <Heart size={18} strokeWidth={2} className="drop-shadow-sm" />
      </span>

      <div className="absolute inset-x-0 bottom-0 flex flex-col px-2.5 pb-2 pt-8">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-tight text-white">{restaurant.name}</h3>
        {tags ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-white/85">{tags}</p>
        ) : null}
        <span className="mt-1.5 inline-flex w-fit rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-900">
          {prep}
        </span>
        <p className="mt-1.5 text-[10px] font-semibold text-[#86EFAC]">{freeLine}</p>
      </div>
    </Link>
  );
}
