'use client';

import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { shopPublicPath } from '@/lib/shop-url';
import { restaurantDeliveryLabel } from '@/lib/restaurant-card-meta';
import { uz } from '@/lib/uz';
import type { ShopBusiness } from '@/hooks/use-shops-data';

const TILE_TINTS = [
  'bg-[#FCE7F3]',
  'bg-[#EDE9FE]',
  'bg-[#FEF3C7]',
  'bg-[#DCFCE7]',
  'bg-[#E0E7FF]',
  'bg-[#FFEDD5]',
] as const;

function minFromLabel(amount: string | number | null | undefined): string {
  const n = Number(amount ?? 0);
  const value = Number.isFinite(n) && n > 0 ? Math.round(n).toLocaleString('uz-UZ') : '0';
  return uz.fromPrice(value);
}

function availabilityLabel(store: ShopBusiness): string {
  if (store.isOpen === false) {
    if (store.closesAt?.trim()) return store.closesAt.trim();
    return uz.closed;
  }
  return restaurantDeliveryLabel(store);
}

type Props = {
  store: ShopBusiness;
  index?: number;
  fromType?: string | null;
};

export function StoreHubShopCard({ store, index = 0, fromType }: Props) {
  const logo = resolveImageUrl(store.logoUrl ?? store.coverUrl);
  const href = shopPublicPath(store, { fromType });

  return (
    <Link href={href} className="w-[4.75rem] shrink-0 active:scale-[0.97]">
      <div
        className={clsx(
          'relative aspect-square overflow-hidden rounded-[18px] ring-1 ring-black/[0.04]',
          TILE_TINTS[index % TILE_TINTS.length],
        )}
      >
        {logo ? (
          <Image
            src={logo}
            alt={store.name}
            fill
            className="object-contain p-2"
            sizes="76px"
            priority={index < 4}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xl font-black text-zinc-500">
            {store.name.charAt(0)}
          </span>
        )}
      </div>
      <p className="mt-1.5 truncate text-center text-[11px] font-semibold leading-tight text-zinc-600">
        {availabilityLabel(store)}
      </p>
      <p className="truncate text-center text-[11px] font-medium leading-tight text-zinc-500">
        {minFromLabel(store.minOrderAmount)}
      </p>
    </Link>
  );
}
