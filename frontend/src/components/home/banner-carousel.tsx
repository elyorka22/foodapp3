'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import { uz } from '@/lib/uz';
import type { HomeBanner } from '@/hooks/use-home-data';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

function ImageSlide({ banner, href }: { banner: HomeBanner; href?: string }) {
  const src = resolveImageUrl(banner.imageUrl);
  if (!src) return null;

  const img = (
    <div className="relative aspect-[2.15/1] w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-card">
      <Image
        src={src}
        alt={banner.title?.trim() || 'Banner'}
        fill
        className="object-cover"
        sizes="(max-width: 430px) 100vw, 430px"
        priority
        unoptimized
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block active:scale-[0.99] transition-transform">
        {img}
      </Link>
    );
  }
  return img;
}

export function BannerCarousel({ banners, isLoading }: Props) {
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
  }, [withImages.length]);

  if (isLoading) {
    return <Skeleton className="aspect-[2.15/1] w-full rounded-2xl" />;
  }

  if (!withImages.length) {
    return null;
  }

  const banner = withImages[index];
  const href = banner.linkUrl?.trim() || undefined;

  return (
    <div>
      <ImageSlide banner={banner} href={href} />
      {withImages.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {withImages.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={uz.slide(i + 1)}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-5 bg-brand-500' : 'w-1.5 bg-zinc-300',
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
