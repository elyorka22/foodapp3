'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';
import type { HomeBanner } from '@/hooks/use-home-data';

type Props = {
  banners: HomeBanner[];
  tall?: boolean;
  className?: string;
};

function BannerSlide({ banner, tall }: { banner: HomeBanner; tall?: boolean }) {
  const src = resolveImageUrl(banner.imageUrl);
  if (!src) return null;

  const href = banner.linkUrl?.trim() || undefined;
  const title = banner.title?.trim();

  const inner = (
    <div
      className={clsx(
        'relative w-full overflow-hidden rounded-3xl bg-zinc-200 shadow-card',
        tall ? 'h-full min-h-[280px]' : 'min-h-[132px] h-full flex-1',
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
      <Link href={href} className="block h-full active:scale-[0.98]">
        {inner}
      </Link>
    );
  }
  return <div className="h-full">{inner}</div>;
}

export function BannerSlotCarousel({ banners, tall, className }: Props) {
  const [index, setIndex] = useState(0);
  const withImages = banners.filter((b) => resolveImageUrl(b.imageUrl));

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

  if (!withImages.length) return null;

  const showDots = withImages.length > 1;

  return (
    <div className={clsx('relative flex h-full min-h-0 flex-col', className)}>
      <div className="relative min-h-0 flex-1">
        <BannerSlide banner={withImages[index]} tall={tall} />
      </div>
      {showDots ? (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {withImages.map((b, i) => (
            <button
              key={b.id}
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
