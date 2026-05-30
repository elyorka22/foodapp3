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
  'from-orange-500 to-orange-600',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-600',
  'from-amber-600 to-orange-700',
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
    restaurant.description?.slice(0, 36) ||
    '';
  const prepMin = restaurant.avgPrepMinutes ?? 25;
  const prep = `${Math.max(15, prepMin - 5)}–${prepMin + 5} ${uz.min}`;

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="relative block aspect-[5/6] overflow-hidden rounded-2xl transition active:scale-[0.98]"
    >
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
            'absolute inset-0 bg-gradient-to-br',
            FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
          )}
        />
      )}

      {/* Light bottom fade only — keeps photo bright */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/70 to-transparent" />

      <span
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/90 bg-white/25 text-white backdrop-blur-[2px]"
        aria-hidden
      >
        <Heart size={14} strokeWidth={2} />
      </span>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white">{restaurant.name}</h3>
        {tags && (
          <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-white/90">{tags}</p>
        )}
        <span className="mt-2 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-800">
          {prep}
        </span>
      </div>
    </Link>
  );
}
