'use client';

import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeBanner } from '@/hooks/use-home-data';

type Placement = 'HOME_MAIN' | 'HOME_SIDE_TOP' | 'HOME_SIDE_BOTTOM';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

function pickBanner(banners: HomeBanner[], placement: Placement) {
  return banners.find((b) => (b.placement ?? 'HERO') === placement && resolveImageUrl(b.imageUrl));
}

function BannerTile({
  banner,
  className,
  tall,
}: {
  banner: HomeBanner;
  className?: string;
  tall?: boolean;
}) {
  const src = resolveImageUrl(banner.imageUrl);
  if (!src) return null;

  const href = banner.linkUrl?.trim() || undefined;
  const title = banner.title?.trim();

  const inner = (
    <div
      className={clsx(
        'relative w-full overflow-hidden rounded-3xl bg-zinc-200 shadow-card',
        tall ? 'h-full min-h-[280px]' : 'min-h-[132px] flex-1',
        className,
      )}
    >
      <Image src={src} alt={title || 'Banner'} fill className="object-cover" sizes="50vw" unoptimized />
      {title ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <p className="absolute bottom-3 left-3 right-3 text-base font-bold leading-snug text-white drop-shadow-sm">
            {title}
          </p>
        </>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={clsx('block h-full active:scale-[0.98]', className)}>
        {inner}
      </Link>
    );
  }
  return <div className={clsx('h-full', className)}>{inner}</div>;
}

function Placeholder({ tall }: { tall?: boolean }) {
  return (
    <div
      className={clsx(
        'rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200',
        tall ? 'min-h-[280px] h-full' : 'min-h-[132px] flex-1',
      )}
    />
  );
}

export function HomeBannerGrid({ banners, isLoading }: Props) {
  const main = pickBanner(banners, 'HOME_MAIN');
  const top = pickBanner(banners, 'HOME_SIDE_TOP');
  const bottom = pickBanner(banners, 'HOME_SIDE_BOTTOM');

  // Fallback: legacy HERO/PROMO until admin assigns grid placements
  const legacyHero = banners.filter((b) => {
    const p = b.placement ?? 'HERO';
    return (p === 'HERO' || p === 'PROMO') && resolveImageUrl(b.imageUrl);
  });
  const fallbackMain = main ?? legacyHero[0];
  const fallbackTop = top ?? legacyHero[1];
  const fallbackBottom = bottom ?? legacyHero[2];

  if (isLoading) {
    return (
      <div className="mt-5 grid h-[280px] grid-cols-2 gap-3">
        <Skeleton className="row-span-2 h-full rounded-3xl" />
        <Skeleton className="h-full min-h-[132px] rounded-3xl" />
        <Skeleton className="h-full min-h-[132px] rounded-3xl" />
      </div>
    );
  }

  if (!fallbackMain && !fallbackTop && !fallbackBottom) {
    return null;
  }

  return (
    <section className="mt-5" aria-label="Bosh sahifa bannerlari">
      <div className="grid h-[280px] grid-cols-2 grid-rows-2 gap-3">
        <div className="row-span-2 min-h-0">
          {fallbackMain ? <BannerTile banner={fallbackMain} tall /> : <Placeholder tall />}
        </div>
        <div className="flex min-h-0 flex-col">
          {fallbackTop ? <BannerTile banner={fallbackTop} /> : <Placeholder />}
        </div>
        <div className="flex min-h-0 flex-col">
          {fallbackBottom ? <BannerTile banner={fallbackBottom} /> : <Placeholder />}
        </div>
      </div>
    </section>
  );
}
