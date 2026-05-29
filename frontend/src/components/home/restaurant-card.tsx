'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-url';
import type { HomeRestaurant } from '@/hooks/use-home-data';

type Props = {
  restaurant: HomeRestaurant;
  variant?: 'horizontal' | 'vertical';
};

export function RestaurantCard({ restaurant, variant = 'horizontal' }: Props) {
  const imageUrl = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
  const address = restaurant.branches?.[0]?.address;
  const categoryLabel = restaurant.categories?.[0]?.name;

  if (variant === 'vertical') {
    return (
      <Link
        href={`/restaurants/${restaurant.slug}`}
        className="group flex w-[9.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-card transition active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="152px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-2xl font-bold text-brand-600">
              {restaurant.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {restaurant.name}
          </h3>
          {categoryLabel && (
            <p className="mt-0.5 text-xs text-zinc-500">{categoryLabel}</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="group flex gap-3 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-3 shadow-card transition active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="72px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xl font-bold text-brand-600">
            {restaurant.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{restaurant.name}</h3>
        {restaurant.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {restaurant.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-0.5 text-amber-600">
            <Star size={12} fill="currentColor" />
            4.8
          </span>
          {categoryLabel && <span>· {categoryLabel}</span>}
          {address && (
            <span className="inline-flex items-center gap-0.5 truncate">
              <MapPin size={12} />
              {address.split(',')[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
