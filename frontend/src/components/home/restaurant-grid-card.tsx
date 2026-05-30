'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const CARD_THEMES = [
  'from-orange-500 to-orange-600',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-600',
  'from-amber-600 to-orange-700',
] as const;

const FOOD_EMOJI = ['🍔', '🍣', '🍕', '🍜'];

type Props = {
  restaurant: HomeRestaurant;
  index: number;
};

export function RestaurantGridCard({ restaurant, index }: Props) {
  const theme = CARD_THEMES[index % CARD_THEMES.length];
  const emoji = FOOD_EMOJI[index % FOOD_EMOJI.length];
  const imageUrl = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
  const tags =
    restaurant.categories?.map((c) => c.name).join(', ') ||
    restaurant.description?.slice(0, 28) ||
    'Fast food';
  const prep = restaurant.avgPrepMinutes
    ? `${Math.max(15, restaurant.avgPrepMinutes - 5)}-${restaurant.avgPrepMinutes + 5} min`
    : '20-30 min';
  const minOrder = restaurant.minOrderAmount
    ? `${Number(restaurant.minOrderAmount).toLocaleString('uz-UZ')} so'm`
    : "30 000 so'm";

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className={clsx(
        'relative flex min-h-[168px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-3.5 shadow-card transition active:scale-[0.98]',
        theme,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-400 px-2 py-0.5 text-xs font-bold text-zinc-900 shadow-sm">
          4.8
          <Star size={12} fill="currentColor" className="text-amber-600" />
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 text-white"
          aria-hidden
        >
          <Heart size={16} strokeWidth={2} />
        </span>
      </div>

      <div className="relative z-10 mt-1 max-w-[58%] flex-1">
        <h3 className="text-base font-bold leading-tight text-white drop-shadow-sm">
          {restaurant.name}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/90">{tags}</p>
        <span className="mt-2 inline-block rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-800">
          {prep}
        </span>
      </div>

      <div className="relative z-10 mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
        {minOrder}dan bepul
      </div>

      <div className="pointer-events-none absolute -right-2 bottom-0 top-6 flex w-[48%] items-center justify-center">
        {imageUrl ? (
          <div className="relative h-[7.5rem] w-[7.5rem]">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-contain drop-shadow-2xl"
              sizes="120px"
              unoptimized
            />
          </div>
        ) : (
          <span className="text-[5rem] leading-none drop-shadow-2xl">{emoji}</span>
        )}
      </div>
    </Link>
  );
}
