'use client';

import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { coverObjectPosition } from '@/lib/cover-position';
import { restaurantPublicPath } from '@/lib/restaurant-url';
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

function formatMinOrder(value: string | number | null | undefined): string | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isNaN(n)) return null;
  return `Min: ${Math.round(n).toLocaleString('uz-UZ')} UZS`;
}

export function RestaurantGridCard({ restaurant, index }: Props) {
  const imageUrl = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
  const objectPosition = coverObjectPosition(
    restaurant.coverPositionX,
    restaurant.coverPositionY,
  );
  const minOrder = formatMinOrder(restaurant.minOrderAmount);
  const href = restaurantPublicPath(restaurant);

  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-3xl border border-zinc-100/80 bg-white shadow-card transition active:scale-[0.98]"
    >
      <div className="relative aspect-video w-full bg-zinc-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            style={{ objectPosition }}
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
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold leading-snug text-zinc-900">{restaurant.name}</h3>
        {restaurant.description?.trim() ? (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{restaurant.description}</p>
        ) : null}
        {minOrder ? <p className="mt-2 text-xs font-medium text-zinc-400">{minOrder}</p> : null}
      </div>
    </Link>
  );
}
