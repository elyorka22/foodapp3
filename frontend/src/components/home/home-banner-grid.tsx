'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeBanner } from '@/hooks/use-home-data';
import type { ShopBusiness } from '@/hooks/use-shops-data';
import { resolveImageUrl as imgUrl } from '@/lib/image-url';
import { BannerSlotCarousel } from './banner-slot-carousel';
import { HomeStoreSlotCarousel } from './home-store-slot-carousel';

type Placement = 'HOME_MAIN' | 'HOME_SIDE_TOP';

type Props = {
  banners: HomeBanner[];
  featuredStores?: ShopBusiness[];
  isLoading?: boolean;
};

function listBanners(banners: HomeBanner[], placement: Placement): HomeBanner[] {
  return banners.filter((b) => (b.placement ?? 'HERO') === placement && resolveImageUrl(b.imageUrl));
}

function Placeholder({
  tall,
  href,
  label,
}: {
  tall?: boolean;
  href?: string;
  label?: string;
}) {
  const inner = (
    <div
      className={clsx(
        'flex items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100',
        tall ? 'min-h-[280px] h-full' : 'min-h-[132px] flex-1',
      )}
    >
      {label ? (
        <span className="px-3 text-center text-sm font-semibold text-emerald-800">{label}</span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={clsx('block h-full active:scale-[0.98]', tall ? 'min-h-0' : '')}>
        {inner}
      </Link>
    );
  }
  return inner;
}

function Slot({
  banners,
  tall,
  defaultHref,
  placeholderHref,
  placeholderLabel,
}: {
  banners: HomeBanner[];
  tall?: boolean;
  defaultHref?: string;
  placeholderHref?: string;
  placeholderLabel?: string;
}) {
  if (!banners.length) {
    return (
      <Placeholder
        tall={tall}
        href={placeholderHref}
        label={placeholderLabel}
      />
    );
  }
  return (
    <BannerSlotCarousel
      banners={banners}
      tall={tall}
      defaultHref={defaultHref}
    />
  );
}

function storesWithImages(stores: ShopBusiness[] | undefined): ShopBusiness[] {
  return (stores ?? []).filter((s) => imgUrl(s.coverUrl ?? s.logoUrl));
}

export function HomeBannerGrid({ banners, featuredStores, isLoading }: Props) {
  const legacyHero = banners.filter((b) => {
    const p = b.placement ?? 'HERO';
    return (p === 'HERO' || p === 'PROMO') && resolveImageUrl(b.imageUrl);
  });

  const mainList = listBanners(banners, 'HOME_MAIN');
  const topList = listBanners(banners, 'HOME_SIDE_TOP');

  const mainBanners = mainList.length > 0 ? mainList : legacyHero;
  const topBanners = topList.length > 0 ? topList : [];
  const storeSlides = storesWithImages(featuredStores);

  const hasContent =
    mainBanners.length > 0 ||
    topBanners.length > 0 ||
    storeSlides.length > 0 ||
    (featuredStores?.length ?? 0) > 0;

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
          <Slot banners={topBanners} defaultHref="/booking" placeholderHref="/booking" placeholderLabel="Stol bron qilish" />
        </div>
        <div className="flex min-h-0 flex-col">
          <HomeStoreSlotCarousel stores={featuredStores ?? []} />
        </div>
      </div>
    </section>
  );
}
