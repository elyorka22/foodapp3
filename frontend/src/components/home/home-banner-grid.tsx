'use client';

import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeBanner } from '@/hooks/use-home-data';
import { BannerSlotCarousel } from './banner-slot-carousel';

type Placement = 'HOME_MAIN' | 'HOME_SIDE_TOP' | 'HOME_SIDE_BOTTOM';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

function listBanners(banners: HomeBanner[], placement: Placement): HomeBanner[] {
  return banners.filter((b) => (b.placement ?? 'HERO') === placement && resolveImageUrl(b.imageUrl));
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

function Slot({
  banners,
  tall,
  className,
}: {
  banners: HomeBanner[];
  tall?: boolean;
  className?: string;
}) {
  if (!banners.length) {
    return <Placeholder tall={tall} />;
  }
  return <BannerSlotCarousel banners={banners} tall={tall} className={className} />;
}

export function HomeBannerGrid({ banners, isLoading }: Props) {
  const legacyHero = banners.filter((b) => {
    const p = b.placement ?? 'HERO';
    return (p === 'HERO' || p === 'PROMO') && resolveImageUrl(b.imageUrl);
  });

  const mainList = listBanners(banners, 'HOME_MAIN');
  const topList = listBanners(banners, 'HOME_SIDE_TOP');
  const bottomList = listBanners(banners, 'HOME_SIDE_BOTTOM');

  const mainBanners = mainList.length > 0 ? mainList : legacyHero;
  const topBanners = topList.length > 0 ? topList : [];
  const bottomBanners = bottomList.length > 0 ? bottomList : [];

  const hasContent = mainBanners.length > 0 || topBanners.length > 0 || bottomBanners.length > 0;

  if (isLoading) {
    return (
      <div className="mt-5 grid h-[280px] grid-cols-2 gap-3">
        <Skeleton className="row-span-2 h-full rounded-3xl" />
        <Skeleton className="h-full min-h-[132px] rounded-3xl" />
        <Skeleton className="h-full min-h-[132px] rounded-3xl" />
      </div>
    );
  }

  if (!hasContent) {
    return null;
  }

  return (
    <section className="mt-5" aria-label="Bosh sahifa bannerlari">
      <div className="grid h-[280px] grid-cols-2 grid-rows-2 gap-3">
        <div className="row-span-2 min-h-0">
          <Slot banners={mainBanners} tall />
        </div>
        <div className="flex min-h-0 flex-col">
          <Slot banners={topBanners} />
        </div>
        <div className="flex min-h-0 flex-col">
          <Slot banners={bottomBanners} />
        </div>
      </div>
    </section>
  );
}
