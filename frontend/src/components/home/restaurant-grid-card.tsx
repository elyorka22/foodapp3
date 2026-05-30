'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
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
  const tags =
    restaurant.categories?.map((c) => c.name).join(', ') ||
    restaurant.description?.slice(0, 40) ||
    '';
  const prepMin = restaurant.avgPrepMinutes ?? 25;
  const prep = `${Math.max(15, prepMin - 5)}–${prepMin + 5} ${uz.min}`;

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-card transition active:scale-[0.98]"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={restaurant.name}
          fill
          className="object-cover"
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />

      <span
        className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/90 bg-black/20 text-white backdrop-blur-sm"
        aria-hidden
      >
        <Heart size={16} strokeWidth={2} />
      </span>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-3 pt-8">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-tight text-white drop-shadow-sm">
          {restaurant.name}
        </h3>
        {tags && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/90">{tags}</p>
        )}
        <span className="mt-3 inline-block rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-sm">
          {prep}
        </span>
      </div>
    </Link>
  );
}
