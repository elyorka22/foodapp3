'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from '@/components/home/section-header';
import type { HomeBanner } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

function promoList(banners: HomeBanner[]): HomeBanner[] {
  return banners
    .filter((b) => resolveImageUrl(b.imageUrl))
    .filter((b) => {
      const p = b.placement ?? 'HERO';
      return p === 'HERO' || p === 'PROMO' || p === 'HOME_MAIN' || p === 'HOME_SIDE_TOP';
    })
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function HomePromoBanners({ banners, isLoading }: Props) {
  const slides = promoList(banners);

  if (isLoading) {
    return (
      <section className="mt-6" aria-label={uz.specialOffers}>
        <SectionHeader title={uz.specialOffers} href="/promotions" linkLabel={uz.seeAll} />
        <div className="-mx-4 flex gap-3 overflow-hidden px-4">
          <Skeleton className="h-[150px] w-[85%] shrink-0 rounded-[24px] shadow-none" />
          <Skeleton className="h-[150px] w-[85%] shrink-0 rounded-[24px] shadow-none" />
        </div>
      </section>
    );
  }

  if (!slides.length) return null;

  return (
    <section className="mt-6" aria-label={uz.specialOffers}>
      <SectionHeader title={uz.specialOffers} href="/promotions" linkLabel={uz.seeAll} />
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {slides.map((banner) => {
          const src = resolveImageUrl(banner.imageUrl)!;
          const href = banner.linkUrl?.trim() || '/promotions';
          const title = banner.title?.trim();

          return (
            <Link
              key={banner.id}
              href={href}
              className="relative h-[150px] w-[85%] shrink-0 overflow-hidden rounded-[24px] bg-zinc-200 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition active:scale-[0.99]"
            >
              <Image
                src={src}
                alt={title || uz.specialOffers}
                fill
                className="object-cover"
                style={categoryImageStyle({
                  imageScale: banner.imageScale,
                  imagePositionX: banner.imagePositionX,
                  imagePositionY: banner.imagePositionY,
                })}
                sizes="(max-width: 430px) 85vw, 360px"
                unoptimized
              />
              {title ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-[15px] font-bold text-white">
                    {title}
                  </p>
                </>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
