'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart, PersonStanding, Search, Star, X } from 'lucide-react';
import { BusinessAvailabilityBadge } from '@/components/business/business-availability-badge';
import { resolveImageUrl } from '@/lib/image-url';
import { restaurantDeliveryLabel } from '@/lib/restaurant-card-meta';
import { uz } from '@/lib/uz';

type Props = {
  title: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  backHref?: string;
  isOpen?: boolean;
  closesAt?: string | null;
  closingSoon?: boolean;
  averageRating?: number | null;
  reviewCount?: number | null;
  deliveryMinutes?: number | null;
  minOrderAmount?: number | null;
};

export function RestaurantMenuHeader({
  title,
  logoUrl,
  coverUrl,
  backHref = '/',
  isOpen,
  closesAt,
  closingSoon,
  averageRating,
  reviewCount,
  deliveryMinutes,
  minOrderAmount,
}: Props) {
  const cover = resolveImageUrl(coverUrl ?? logoUrl);
  const logo = resolveImageUrl(logoUrl);
  const rating =
    averageRating != null && !Number.isNaN(Number(averageRating))
      ? Number(averageRating).toFixed(1).replace('.', ',')
      : null;
  const delivery = restaurantDeliveryLabel({ deliveryMinutes: deliveryMinutes ?? undefined });
  const minOrder =
    minOrderAmount != null && Number.isFinite(Number(minOrderAmount))
      ? uz.orderFromAmount(Math.round(Number(minOrderAmount)).toLocaleString('uz-UZ'))
      : null;

  return (
    <div className="relative">
      <div className="relative h-[210px] w-full overflow-hidden bg-zinc-200">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 430px) 100vw, 512px"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 text-5xl font-black text-zinc-400/60">
            {title.charAt(0)}
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/20"
          aria-hidden
        />

        <div className="absolute right-3 top-[calc(env(safe-area-inset-top,0px)+10px)] z-20 flex gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-sm backdrop-blur-sm active:scale-95"
            aria-label={uz.searchAria}
          >
            <Search size={20} strokeWidth={2} />
          </button>
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-sm backdrop-blur-sm active:scale-95"
            aria-label={uz.back}
          >
            <X size={20} strokeWidth={2.25} />
          </Link>
        </div>
      </div>

      <div className="relative z-10 -mt-8 px-3">
        <div className="rounded-[22px] bg-white px-4 py-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04]">
          <div className="flex items-start gap-3">
            {logo && coverUrl ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-black/[0.04]">
                <Image
                  src={logo}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-zinc-900">
                {title}
              </h1>
              {rating ? (
                <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-zinc-700">
                  <Star
                    size={14}
                    className="fill-amber-400 text-amber-400"
                    strokeWidth={0}
                  />
                  <span className="font-bold">{rating}</span>
                  {reviewCount != null && reviewCount > 0 ? (
                    <span className="text-zinc-400">
                      · {uz.ratingsCount(reviewCount)}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 active:bg-zinc-100"
              aria-label={uz.favoritesAria}
            >
              <Heart size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[13px] font-medium text-zinc-600">
            <PersonStanding size={16} className="shrink-0 text-zinc-400" aria-hidden />
            <span className="min-w-0 truncate">
              {delivery}
              {minOrder ? ` · ${minOrder}` : ''}
            </span>
            <ChevronRight size={16} className="ml-auto shrink-0 text-zinc-300" aria-hidden />
          </div>

          {isOpen != null ? (
            <div className="mt-2.5">
              <BusinessAvailabilityBadge
                isOpen={isOpen}
                closesAt={closesAt}
                closingSoon={closingSoon}
                compact
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
