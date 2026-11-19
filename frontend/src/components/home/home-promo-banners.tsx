'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/image-url';
import { categoryImageStyle } from '@/lib/category-image-style';
import { Skeleton } from '@/components/ui/skeleton';
import { SECTION_ISLAND_GAP } from '@/components/ui/section-island';
import type { HomeBanner } from '@/hooks/use-home-data';
import { uz } from '@/lib/uz';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

const BANNER_HEIGHT = 'h-[120px]';

/** Promo strip — full-bleed, no section title. PROMO canonical; HERO for legacy. */
function promoList(banners: HomeBanner[]): HomeBanner[] {
  return banners
    .filter((b) => resolveImageUrl(b.imageUrl))
    .filter((b) => {
      const p = b.placement ?? 'PROMO';
      return p === 'PROMO' || p === 'HERO';
    })
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function HomePromoBanners({ banners, isLoading }: Props) {
  const slides = promoList(banners);

  if (isLoading) {
    return (
      <section className={SECTION_ISLAND_GAP} aria-label={uz.specialOffers}>
        <div className="flex overflow-hidden">
          <Skeleton className={`${BANNER_HEIGHT} w-full shrink-0 rounded-[20px] shadow-none`} />
        </div>
      </section>
    );
  }

  if (!slides.length) return null;

  return (
    <section className={SECTION_ISLAND_GAP} aria-label={uz.specialOffers}>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-hide">
        {slides.map((banner, index) => {
          const src = resolveImageUrl(banner.imageUrl)!;
          const href = banner.linkUrl?.trim() || '/promotions';
          const title = banner.title?.trim();

          const framing = categoryImageStyle({
            imageScale: banner.imageScale,
            imagePositionX: banner.imagePositionX,
            imagePositionY: banner.imagePositionY,
          });
          const { transform, transformOrigin, objectPosition } = framing;

          return (
            <Link
              key={banner.id}
              href={href}
              className={`relative ${BANNER_HEIGHT} w-full min-w-full shrink-0 snap-center overflow-hidden rounded-[20px] bg-zinc-200 transition active:scale-[0.99]`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[20px]">
                <div
                  className="absolute inset-0"
                  style={{ transform, transformOrigin }}
                >
                  <Image
                    src={src}
                    alt={title || uz.specialOffers}
                    fill
                    className="object-cover"
                    style={{ objectPosition }}
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              </div>
              {title ? (
                <>
                  <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 right-3 z-[1] line-clamp-2 text-[15px] font-bold text-white">
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
