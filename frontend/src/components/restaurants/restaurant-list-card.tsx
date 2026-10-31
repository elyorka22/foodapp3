'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PersonStanding, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import { restaurantDeliveryLabel } from '@/lib/restaurant-card-meta';
import { restaurantPublicPath } from '@/lib/restaurant-url';
import { uz } from '@/lib/uz';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const FALLBACK = [
  'bg-[#3F3F46]',
  'bg-[#52525B]',
  'bg-[#27272A]',
  'bg-[#1C1917]',
] as const;

function minOrderLabel(amount: string | number | null | undefined): string | null {
  if (amount == null || amount === '') return null;
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return null;
  return uz.orderFromAmount(Math.round(n).toLocaleString('uz-UZ'));
}

type Props = {
  restaurant: HomeRestaurant;
  index?: number;
};

export function RestaurantListCard({ restaurant, index = 0 }: Props) {
  const imageUrl = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
  const href = restaurantPublicPath(restaurant);
  const delivery = restaurantDeliveryLabel(restaurant);
  const rating =
    restaurant.averageRating != null && !Number.isNaN(Number(restaurant.averageRating))
      ? Number(restaurant.averageRating).toFixed(1).replace('.', ',')
      : null;
  const minOrder = minOrderLabel(restaurant.minOrderAmount);
  const framing = categoryImageStyle({
    imageScale: restaurant.coverScale,
    imagePositionX: restaurant.coverPositionX,
    imagePositionY: restaurant.coverPositionY,
  });
  const { transform, transformOrigin, objectPosition } = framing;

  return (
    <Link href={href} className="block transition active:scale-[0.99]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-zinc-200 ring-1 ring-black/[0.04]">
        {imageUrl ? (
          <div className="absolute inset-0 overflow-hidden rounded-[20px]">
            <div className="absolute inset-0" style={{ transform, transformOrigin }}>
              <Image
                src={imageUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
                style={{ objectPosition }}
                sizes="(max-width: 430px) 100vw, 512px"
                priority={index < 2}
              />
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              'absolute inset-0 flex items-center justify-center',
              FALLBACK[index % FALLBACK.length],
            )}
          >
            <span className="text-5xl font-black text-white/35">
              {restaurant.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[16px] font-extrabold uppercase tracking-tight text-zinc-900">
            {restaurant.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-zinc-500">
            <PersonStanding size={15} className="shrink-0 text-zinc-400" aria-hidden />
            <span className="truncate">
              {delivery}
              {minOrder ? ` · ${minOrder}` : ''}
            </span>
          </p>
        </div>
        {rating ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 pt-0.5 text-[13px] font-semibold text-zinc-800">
            <Star size={13} className="fill-amber-400 text-amber-400" strokeWidth={0} />
            {rating}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
