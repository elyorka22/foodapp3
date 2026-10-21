'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { shopPublicPath } from '@/lib/shop-url';
import { restaurantDeliveryLabel } from '@/lib/restaurant-card-meta';
import { uz } from '@/lib/uz';
import { Skeleton } from '@/components/ui/skeleton';
import type { ShopBusiness } from '@/hooks/use-shops-data';

const TILE_TINTS = [
  'bg-[#E8F5E9]',
  'bg-[#E3F2FD]',
  'bg-[#FFF3E0]',
  'bg-[#FCE4EC]',
  'bg-[#E0F7FA]',
  'bg-[#FFF8E1]',
  'bg-[#EFEBE9]',
] as const;

function tintFor(name: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % 997;
  }
  return TILE_TINTS[(hash + index) % TILE_TINTS.length];
}

type Props = {
  stores: ShopBusiness[];
  isLoading?: boolean;
  total?: number;
};

export function HomeShopsCarousel({ stores, isLoading, total }: Props) {
  if (!isLoading && stores.length === 0) return null;

  const count = total ?? stores.length;

  return (
    <section className="mt-6" aria-label={uz.shopsTitle}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-extrabold tracking-tight text-zinc-900">
          {uz.shopsTitle}
        </h2>
        <Link
          href="/stores"
          className="flex shrink-0 items-center gap-0.5 text-[14px] font-medium text-zinc-400 transition active:opacity-70"
        >
          {uz.seeAll}
          {count > 0 ? ` ${count}` : ''}
          <ChevronRight size={16} strokeWidth={2.25} />
        </Link>
      </div>

      {isLoading ? (
        <div className="-mx-4 flex gap-3 overflow-hidden px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[7.25rem] shrink-0 space-y-2">
              <Skeleton className="aspect-square w-full rounded-2xl shadow-none" />
              <Skeleton className="h-3 w-16 shadow-none" />
              <Skeleton className="h-5 w-20 rounded-full shadow-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="-mr-4 flex gap-3 overflow-x-auto pr-4 pb-1 scrollbar-hide">
          {stores.map((store, index) => {
            const logo = resolveImageUrl(store.logoUrl ?? store.coverUrl);
            const href = shopPublicPath(store);
            const delivery = restaurantDeliveryLabel(store);
            const typeLabel = store.businessType?.name?.trim();

            return (
              <Link
                key={store.id}
                href={href}
                className="w-[7.25rem] shrink-0 transition active:scale-[0.98]"
              >
                <div
                  className={clsx(
                    'relative aspect-square overflow-hidden rounded-2xl ring-1 ring-black/[0.04]',
                    tintFor(store.name, index),
                  )}
                >
                  {logo ? (
                    <Image
                      src={logo}
                      alt={store.name}
                      fill
                      className="object-contain p-3"
                      sizes="116px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-3xl font-black text-zinc-400/70">
                        {store.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-[13px] font-semibold leading-tight text-zinc-900">
                  {delivery}
                </p>
                {typeLabel ? (
                  <span className="mt-1 inline-block max-w-full truncate rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                    {typeLabel}
                  </span>
                ) : (
                  <p className="mt-1 line-clamp-1 text-[12px] font-medium text-zinc-500">
                    {store.name}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
