'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PersonStanding, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { restaurantDeliveryLabel } from '@/lib/restaurant-card-meta';
import { shopPublicPath } from '@/lib/shop-url';
import { uz } from '@/lib/uz';
import type { ShopBusiness } from '@/hooks/use-shops-data';

const FALLBACK = [
  'bg-[#16A34A]',
  'bg-[#2563EB]',
  'bg-[#DC2626]',
  'bg-[#EA580C]',
  'bg-[#1D4ED8]',
  'bg-[#CA8A04]',
  'bg-[#DB2777]',
] as const;

function minOrderLabel(amount: string | number | null | undefined): string | null {
  if (amount == null || amount === '') return null;
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return null;
  return uz.orderFromAmount(Math.round(n).toLocaleString('uz-UZ'));
}

type Props = {
  store: ShopBusiness;
  index?: number;
  fromType?: string | null;
  /** Hide type label when list is already scoped to one type. */
  hideTypeLabel?: boolean;
};

export function ShopListRow({
  store,
  index = 0,
  fromType,
  hideTypeLabel = false,
}: Props) {
  const imageUrl = resolveImageUrl(store.logoUrl ?? store.coverUrl);
  const href = shopPublicPath(store, { fromType });
  const delivery = restaurantDeliveryLabel(store);
  const rating =
    store.averageRating != null && !Number.isNaN(Number(store.averageRating))
      ? Number(store.averageRating).toFixed(1).replace('.', ',')
      : null;
  const minOrder = minOrderLabel(store.minOrderAmount);

  return (
    <Link href={href} className="flex items-center gap-3.5 py-2.5 active:opacity-80">
      <div
        className={clsx(
          'relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[18px]',
          !imageUrl && FALLBACK[index % FALLBACK.length],
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={store.name}
            fill
            className="object-cover"
            sizes="72px"
            priority={index < 4}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-black text-white/90">
            {store.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[16px] font-extrabold tracking-tight text-zinc-900">
            {store.name}
          </h3>
          {rating ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 pt-0.5 text-[13px] font-semibold text-zinc-800">
              <Star size={13} className="fill-amber-400 text-amber-400" strokeWidth={0} />
              {rating}
            </span>
          ) : null}
        </div>

        <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-zinc-500">
          <PersonStanding size={15} className="shrink-0 text-zinc-400" aria-hidden />
          <span className="truncate">
            {delivery}
            {minOrder ? ` · ${minOrder}` : ''}
          </span>
        </p>

        {!hideTypeLabel && store.businessType?.name ? (
          <p className="mt-1.5 truncate text-[12px] font-semibold text-emerald-700">
            {store.businessType.name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
