'use client';

import { resolveImageUrl } from '@/lib/image-url';
import type { HomeBanner } from '@/hooks/use-home-data';
import type { ShopBusiness } from '@/hooks/use-shops-data';
import { isStoreKind } from '@/lib/business-kind';
import { BannerSlotCarousel } from '@/components/home/banner-slot-carousel';
import { uz } from '@/lib/uz';

type Props = {
  banners: HomeBanner[];
  stores?: ShopBusiness[];
};

/** Full-width store promo carousel above dish categories. Hidden when no stores exist. */
export function HomeStoreBannersCarousel({ banners, stores }: Props) {
  const storeList = (stores ?? []).filter((s) =>
    isStoreKind(s.kind, s.businessType?.slug),
  );
  if (storeList.length === 0) return null;

  const storeIds = new Set(storeList.map((s) => s.id));
  const storeBanners = banners
    .filter((b) => resolveImageUrl(b.imageUrl))
    .filter((b) => {
      const placement = b.placement ?? 'HERO';
      if (placement === 'HOME_SIDE_BOTTOM') return true;
      return Boolean(b.restaurantId && storeIds.has(b.restaurantId));
    })
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (storeBanners.length === 0) return null;

  return (
    <section className="mt-4 h-[140px]" aria-label={uz.shopsTitle}>
      <BannerSlotCarousel banners={storeBanners} />
    </section>
  );
}
