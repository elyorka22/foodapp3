'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Star } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-url';
import { formatSum } from '@/lib/format-sum';
import { restaurantPublicPath } from '@/lib/restaurant-url';
import type { ShopBusiness } from '@/hooks/use-shops-data';

export function ShopBusinessCard({
  business,
  className = 'w-[280px] shrink-0',
}: {
  business: ShopBusiness;
  className?: string;
}) {
  const cover = resolveImageUrl(business.coverUrl);
  const logo = resolveImageUrl(business.logoUrl);
  const href = restaurantPublicPath(business);

  return (
    <Link
      href={href}
      className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition active:scale-[0.98] ${className}`}
    >
      <div className="relative aspect-[16/10] bg-zinc-100">
        {cover ? (
          <Image src={cover} alt={business.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl opacity-30">🏪</div>
        )}
        {logo && (
          <div className="absolute bottom-2 left-2 h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-white shadow">
            <Image src={logo} alt="" width={40} height={40} className="object-cover" unoptimized />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 font-bold text-zinc-900">{business.name}</p>
        <p className="text-xs text-zinc-500">{business.category ?? business.businessType?.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-0.5">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {business.averageRating.toFixed(1)} ({business.reviewCount})
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Clock size={12} />
            {business.deliveryMinutes} daq
          </span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin size={12} />
            2.5 km
          </span>
        </div>
        {business.minOrderAmount != null && business.minOrderAmount > 0 && (
          <p className="mt-1 text-xs text-brand-600">
            Min: {formatSum(business.minOrderAmount)}
          </p>
        )}
      </div>
    </Link>
  );
}
