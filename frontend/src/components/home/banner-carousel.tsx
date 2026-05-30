'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeBanner } from '@/hooks/use-home-data';

type Props = {
  banners: HomeBanner[];
  isLoading?: boolean;
};

function DefaultHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 px-5 py-5 shadow-card">
      <div className="relative z-10 max-w-[58%]">
        <h2 className="text-xl font-bold leading-snug text-white">
          Sevimli taomlaringiz eshigingizda! 😊
        </h2>
        <p className="mt-1.5 text-sm text-white/90">30% gacha chegirmalar faqat siz uchun</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand-600 shadow-md active:scale-95"
        >
          Buyurtma berish
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
      <div className="pointer-events-none absolute -right-2 top-2 flex flex-col items-center">
        <span className="absolute -left-6 top-8 z-20 rounded-lg bg-white px-2 py-1 text-sm font-bold text-brand-600 shadow-md">
          30%
        </span>
        <span className="text-[5.5rem] leading-none drop-shadow-xl">🍔</span>
        <span className="-mt-4 text-[3rem] leading-none drop-shadow-lg">🥤</span>
      </div>
    </div>
  );
}

function PromoSlide({ banner, href }: { banner: HomeBanner; href?: string }) {
  const src = resolveImageUrl(banner.imageUrl);

  const inner = (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 px-5 py-5 shadow-card">
      <div className="relative z-10 max-w-[58%]">
        <h2 className="text-xl font-bold leading-snug text-white">{banner.title}</h2>
        <p className="mt-1.5 text-sm text-white/90">Maxsus takliflar faqat siz uchun</p>
        {href ? (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand-600 shadow-md">
            Buyurtma berish
            <ArrowRight size={16} strokeWidth={2.5} />
          </span>
        ) : (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-brand-600 shadow-md">
            Buyurtma berish
            <ArrowRight size={16} strokeWidth={2.5} />
          </span>
        )}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-[42%]">
        {src ? (
          <Image src={src} alt="" fill className="object-cover object-center opacity-95" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-[5rem]">🍔</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/95 via-brand-600/40 to-transparent" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block active:scale-[0.99]">
        {inner}
      </Link>
    );
  }
  return inner;
}

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
    return <Skeleton className="h-[168px] w-full rounded-3xl" />;
  }

  if (!banners.length) {
    return (
      <div>
        <DefaultHero />
        <div className="mt-3 flex justify-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-brand-500" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
        </div>
      </div>
    );
  }

  const banner = banners[index];
  const href = banner.linkUrl?.trim() || undefined;

  return (
    <div>
      <PromoSlide banner={banner} href={href} />
      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Slayd ${i + 1}`}
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
