'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import { isStoreKind } from '@/lib/business-kind';
import { shopPublicPath } from '@/lib/shop-url';
import { uz } from '@/lib/uz';
import type { ShopBusiness } from '@/hooks/use-shops-data';

type Props = {
  stores: ShopBusiness[];
  className?: string;
  /** Shown when no store has cover/logo. */
  fallbackHref?: string;
  fallbackLabel?: string;
};

function StoreSlide({ store }: { store: ShopBusiness }) {
  const src = resolveImageUrl(store.coverUrl ?? store.logoUrl);
  if (!src) return null;

  const href = shopPublicPath(store);

  return (
    <Link href={href} className="block h-full active:scale-[0.98]">
      <div className="relative h-full min-h-[132px] w-full flex-1 overflow-hidden rounded-3xl bg-zinc-200 shadow-card">
        <Image
          src={src}
          alt={store.name}
          fill
          className="h-full w-full"
          style={categoryImageStyle({
            imageScale: store.coverScale,
            imagePositionX: store.coverPositionX,
            imagePositionY: store.coverPositionY,
          })}
          sizes="50vw"
          unoptimized
        />
      </div>
    </Link>
  );
}

export function HomeStoreSlotCarousel({
  stores,
  className,
  fallbackHref,
  fallbackLabel,
}: Props) {
  const storeOnly = stores.filter((s) => isStoreKind(s.kind, s.businessType?.slug));
  const withImages = storeOnly.filter((s) => resolveImageUrl(s.coverUrl ?? s.logoUrl));
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    if (withImages.length <= 1) return;
    setIndex((i) => (i + 1) % withImages.length);
  }, [withImages.length]);

  useEffect(() => {
    if (withImages.length <= 1) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance, withImages.length]);

  useEffect(() => {
    setIndex(0);
  }, [withImages.length, withImages[0]?.id]);

  if (!withImages.length) {
    if (!fallbackHref) return null;
    return (
      <Link
        href={fallbackHref}
        className={clsx(
          'flex h-full min-h-[132px] flex-1 items-center justify-center rounded-3xl',
          'bg-gradient-to-br from-emerald-50 to-teal-100 active:scale-[0.98]',
          className,
        )}
      >
        <span className="px-3 text-center text-sm font-semibold text-emerald-800">
          {fallbackLabel ?? uz.navShops}
        </span>
      </Link>
    );
  }

  const showDots = withImages.length > 1;

  return (
    <div className={clsx('relative flex h-full min-h-0 flex-col', className)}>
      <div className="relative min-h-0 flex-1">
        <StoreSlide store={withImages[index]} />
      </div>
      {showDots ? (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {withImages.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={uz.slide(i + 1)}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
