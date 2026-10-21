'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, PersonStanding, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import { restaurantDeliveryLabel } from '@/lib/restaurant-card-meta';
import { restaurantPublicPath } from '@/lib/restaurant-url';
import { uz } from '@/lib/uz';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeRestaurant } from '@/hooks/use-home-data';

const FALLBACK = [
  'bg-[#3F3F46]',
  'bg-[#52525B]',
  'bg-[#27272A]',
  'bg-[#1C1917]',
] as const;

/**
 * Two cards visible with a peek of the next — same density as Yandex «Рестораны».
 * ~50% of content width minus gap on a max-w-lg phone frame.
 */
const REST_CARD_WIDTH = 'w-[calc(50%-6px)] min-w-[10.5rem] max-w-[11.5rem]';
const REST_IMAGE_ASPECT = 'aspect-square';

function minOrderLabel(amount: string | number | null | undefined): string | null {
  if (amount == null || amount === '') return null;
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return null;
  return uz.orderFromAmount(Math.round(n).toLocaleString('uz-UZ'));
}

type Props = {
  restaurants: HomeRestaurant[];
  isLoading?: boolean;
  total?: number;
};

export function HomeRestaurantsCarousel({
  restaurants,
  isLoading,
  total,
}: Props) {
  if (!isLoading && restaurants.length === 0) return null;

  const count = total ?? restaurants.length;

  return (
    <section className="mt-6" aria-label={uz.restaurants}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-extrabold tracking-tight text-zinc-900">
          {uz.restaurants}
        </h2>
        <Link
          href="/restaurants"
          className="flex shrink-0 items-center gap-0.5 text-[14px] font-medium text-zinc-400 transition active:opacity-70"
        >
          {uz.seeAll}
          {count > 0 ? ` ${count}` : ''}
          <ChevronRight size={16} strokeWidth={2.25} />
        </Link>
      </div>

      {isLoading ? (
        <div className="-mr-4 flex gap-3 overflow-hidden pr-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={clsx(REST_CARD_WIDTH, 'shrink-0 space-y-2')}>
              <Skeleton className={clsx(REST_IMAGE_ASPECT, 'w-full rounded-[18px] shadow-none')} />
              <Skeleton className="h-4 w-28 shadow-none" />
              <Skeleton className="h-3 w-24 shadow-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="-mr-4 flex gap-3 overflow-x-auto pr-4 pb-1 scrollbar-hide">
          {restaurants.map((restaurant, index) => {
            const imageUrl = resolveImageUrl(
              restaurant.coverUrl ?? restaurant.logoUrl,
            );
            const href = restaurantPublicPath(restaurant);
            const delivery = restaurantDeliveryLabel(restaurant);
            const rating =
              restaurant.averageRating != null &&
              !Number.isNaN(Number(restaurant.averageRating))
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
              <Link
                key={restaurant.id}
                href={href}
                className={clsx(REST_CARD_WIDTH, 'shrink-0 transition active:scale-[0.98]')}
              >
                <div
                  className={clsx(
                    'relative overflow-hidden rounded-[18px] bg-zinc-200 ring-1 ring-black/[0.04]',
                    REST_IMAGE_ASPECT,
                  )}
                >
                  {imageUrl ? (
                    <div className="absolute inset-0 overflow-hidden rounded-[18px]">
                      <div
                        className="absolute inset-0"
                        style={{ transform, transformOrigin }}
                      >
                        <Image
                          src={imageUrl}
                          alt={restaurant.name}
                          fill
                          className="object-cover"
                          style={{ objectPosition }}
                          sizes="180px"
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
                      <span className="text-4xl font-black text-white/40">
                        {restaurant.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 min-w-0 flex-1 text-[14px] font-extrabold uppercase leading-tight tracking-tight text-zinc-900">
                    {restaurant.name}
                  </h3>
                  {rating ? (
                    <span className="inline-flex shrink-0 items-center gap-0.5 pt-0.5 text-[12px] font-semibold text-zinc-800">
                      <Star
                        size={12}
                        className="fill-amber-400 text-amber-400"
                        strokeWidth={0}
                      />
                      {rating}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-zinc-500">
                  <PersonStanding
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-zinc-400"
                    aria-hidden
                  />
                  <span className="truncate">
                    {delivery}
                    {minOrder ? ` · ${minOrder}` : ''}
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
