'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeBanner } from '@/hooks/use-home-data';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

export function BannerCarousel({ banners, isLoading }: Props) {
  const [index, setIndex] = useState(0);

  const advance = useCallback(() => {
    if (banners.length <= 1) return;
    setIndex((i) => (i + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance, banners.length]);

  if (isLoading) {
    return <Skeleton className="aspect-[2.2/1] w-full rounded-2xl" />;
  }

  if (!banners.length) {
    return (
      <div className="relative aspect-[2.2/1] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">FoodApp</p>
        <h2 className="mt-2 max-w-[14rem] text-2xl font-bold leading-tight text-white">
          Delicious food, delivered fast
        </h2>
        <p className="mt-2 text-sm text-white/85">Discover restaurants near you</p>
      </div>
    );
  }

  const banner = banners[index];
  const src = resolveImageUrl(banner.imageUrl);
  const href = banner.linkUrl?.trim() || undefined;

  const slide = (
    <div className="relative aspect-[2.2/1] w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-card dark:bg-zinc-800">
      {src ? (
        <Image
          src={src}
          alt={banner.title}
          fill
          className="object-cover"
          sizes="(max-width: 430px) 100vw, 430px"
          priority={index === 0}
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-brand-100 text-brand-700">
          {banner.title}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-lg font-bold text-white drop-shadow-sm">{banner.title}</p>
      </div>
    </div>
  );

  const content = href ? (
    <Link href={href} className="block active:scale-[0.99] transition-transform">
      {slide}
    </Link>
  ) : (
    slide
  );

  return (
    <div className="relative">
      {content}
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={banners[i].id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                className={clsx(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50',
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
