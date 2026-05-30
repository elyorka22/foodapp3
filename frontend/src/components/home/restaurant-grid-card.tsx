'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { coverObjectPosition } from '@/lib/cover-position';
import { uz } from '@/lib/uz';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const FALLBACK_GRADIENTS = [
  'from-orange-100 to-orange-200',
  'from-pink-100 to-pink-200',
  'from-violet-100 to-violet-200',
  'from-amber-100 to-amber-200',
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
    restaurant.description?.slice(0, 32) ||
    '';
  const prepMin = restaurant.avgPrepMinutes ?? 25;
  const prep = `${Math.max(15, prepMin - 5)}–${prepMin + 5} ${uz.min}`;

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="block overflow-hidden rounded-2xl bg-white transition active:scale-[0.98]"
    >
      <div className="relative aspect-[1.05/1] overflow-hidden bg-zinc-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 430px) 50vw, 200px"
            unoptimized
          />
        ) : (
          <div
            className={clsx(
              'flex h-full items-center justify-center bg-gradient-to-br text-3xl font-bold text-brand-600/40',
              FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
            )}
          >
            {restaurant.name.charAt(0)}
          </div>
        )}

        <span
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-600"
          aria-hidden
        >
          <Heart size={14} strokeWidth={2} />
        </span>
      </div>

      <div className="px-2 pb-2 pt-1.5">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-tight text-zinc-900">
          {restaurant.name}
        </h3>
        {tags && <p className="mt-0.5 line-clamp-1 text-[10px] text-zinc-500">{tags}</p>}
        <p className="mt-1 text-[10px] font-medium text-zinc-600">{prep}</p>
      </div>
    </Link>
  );
}
