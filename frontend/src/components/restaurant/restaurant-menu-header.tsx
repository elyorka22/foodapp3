'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Search } from 'lucide-react';
import { BusinessAvailabilityBadge } from '@/components/business/business-availability-badge';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';

type Props = {
  title: string;
  logoUrl?: string | null;
  backHref?: string;
  isOpen?: boolean;
  closesAt?: string | null;
  closingSoon?: boolean;
};

export function RestaurantMenuHeader({
  title,
  logoUrl,
  backHref = '/',
  isOpen,
  closesAt,
  closingSoon,
}: Props) {
  const logo = resolveImageUrl(logoUrl);

  return (
    <header className="sticky top-0 z-30 bg-[#F5F5F7]/95 backdrop-blur-md pt-[calc(env(safe-area-inset-top,0px)+8px)]">
      <div className="flex items-start justify-between gap-2 px-1 pb-3">
        <Link
          href={backHref}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm active:scale-95"
          aria-label={uz.back}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Link>

        <div className="min-w-0 flex-1 px-1">
          {logo ? (
            <div className="relative h-12 w-full max-w-[180px]">
              <Image
                src={logo}
                alt={title}
                fill
                className="object-contain object-left"
                sizes="180px"
                unoptimized
              />
            </div>
          ) : (
            <h1 className="text-[22px] font-bold leading-tight tracking-tight text-zinc-900">
              {title}
            </h1>
          )}
          {isOpen != null ? (
            <div className="mt-1.5">
              <BusinessAvailabilityBadge
                isOpen={isOpen}
                closesAt={closesAt}
                closingSoon={closingSoon}
                compact
              />
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm active:scale-95"
            aria-label={uz.searchAria}
          >
            <Search size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm active:scale-95"
            aria-label={uz.favoritesAria}
          >
            <Heart size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
