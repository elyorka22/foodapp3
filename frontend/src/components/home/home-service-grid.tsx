'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bike,
  Gift,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { clsx } from 'clsx';
import { uz } from '@/lib/uz';
import type { LucideIcon } from 'lucide-react';

type ImageLayout = {
  /** Relative path under /assets/home-services/ */
  src: string;
  /** Width as % of the card */
  widthPercent: number;
  /** Offset from the right edge (px, may be negative to overhang) */
  right: number;
  /** Offset from the bottom edge (px, may be negative to overhang) */
  bottom: number;
};

type ServiceCard = {
  href: string;
  title: string;
  eta: string;
  badge?: { label: string; tone: 'orange' | 'blue' };
  icon: LucideIcon;
  accent: string;
  iconClass: string;
  image?: ImageLayout;
};

const TOP_CAROUSEL: ServiceCard[] = [
  {
    href: '/restaurants',
    title: uz.homeServiceRestaurants,
    eta: uz.homeServiceRestaurantsEta,
    icon: UtensilsCrossed,
    accent: 'from-[#E4E4E7] to-[#F4F4F5]',
    iconClass: 'text-zinc-800',
    image: {
      src: '/assets/home-services/restaurants.webp',
      widthPercent: 72,
      right: -10,
      bottom: -12,
    },
  },
  {
    href: '/products',
    title: uz.homeServiceProducts,
    eta: uz.homeServiceProductsEta,
    icon: ShoppingBag,
    accent: 'from-[#E8F5E9] to-[#F1F8F2]',
    iconClass: 'text-emerald-600',
    image: {
      src: '/assets/home-services/products.png',
      widthPercent: 56,
      right: -4,
      bottom: -8,
    },
  },
  {
    href: '/promotions',
    title: uz.homeServicePromos,
    eta: uz.homeServicePromosEta,
    icon: Gift,
    accent: 'from-[#E0E7FF] to-[#F5F7FF]',
    iconClass: 'text-indigo-600',
    image: {
      src: '/assets/home-services/promotions.png',
      widthPercent: 54,
      right: -4,
      bottom: -8,
    },
  },
];

const BOTTOM_LARGE: ServiceCard = {
  href: '/restaurants',
  title: uz.homeServiceDelivery,
  eta: uz.homeServiceDeliveryEta,
  badge: { label: uz.homeServiceDeliveryBadge, tone: 'orange' },
  icon: Bike,
  accent: 'from-[#D4D4D8] to-[#F4F4F5]',
  iconClass: 'text-zinc-800',
  image: {
    src: '/assets/home-services/delivery.png',
    widthPercent: 48,
    right: -10,
    bottom: -14,
  },
};

const BOTTOM_SMALL: ServiceCard = {
  href: '/booking',
  title: uz.homeServiceBooking,
  eta: uz.homeServiceBookingEta,
  badge: { label: uz.homeServiceBookingBadge, tone: 'blue' },
  icon: Sparkles,
  accent: 'from-[#E0F2FE] to-[#F0F9FF]',
  iconClass: 'text-sky-600',
  image: {
    src: '/assets/home-services/booking.png',
    widthPercent: 58,
    right: -6,
    bottom: -10,
  },
};

function ServiceTile({
  card,
  className,
  iconSize = 44,
  carousel,
}: {
  card: ServiceCard;
  className?: string;
  iconSize?: number;
  /** Fixed width for carousel slides */
  carousel?: boolean;
}) {
  const Icon = card.icon;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(card.image?.src) && !imageFailed;

  return (
    <Link
      href={card.href}
      className={clsx(
        'relative block min-h-[118px] overflow-visible transition active:scale-[0.98]',
        // Wider first-row tiles so titles like «Mahsulotlar» fit without clipping.
        carousel && 'h-[132px] w-[176px] shrink-0 snap-start',
        className,
      )}
    >
      <div
        className="absolute inset-0 rounded-[26px] bg-[#F3F4F6] shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
        aria-hidden
      />

      <div
        className={clsx(
          'relative z-10 flex h-full flex-col p-3.5',
          !carousel && 'min-h-[118px]',
        )}
      >
        <div
          className={clsx(
            'min-w-0 pr-1',
            carousel ? 'max-w-[72%]' : 'max-w-[62%]',
          )}
        >
          <p className="line-clamp-2 text-[13px] font-bold leading-tight text-zinc-900 sm:text-[15px]">
            {card.title}
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-zinc-400">{card.eta}</p>
        </div>

        {card.badge ? (
          <span
            className={clsx(
              'mt-auto inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold text-white',
              card.badge.tone === 'orange' ? 'bg-zinc-900' : 'bg-sky-500',
            )}
          >
            {card.badge.label}
          </span>
        ) : (
          <span className="mt-auto" />
        )}
      </div>

      {showImage && card.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- local static asset with absolute positioning
        <img
          src={card.image.src}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute z-[5] object-contain drop-shadow-[0_8px_16px_rgba(15,23,42,0.12)]"
          style={{
            width: `${card.image.widthPercent}%`,
            right: card.image.right,
            bottom: card.image.bottom,
          }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={clsx(
            'pointer-events-none absolute -bottom-1 -right-1 z-[5] flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br opacity-95',
            card.accent,
          )}
          aria-hidden
        >
          <Icon size={iconSize} strokeWidth={1.6} className={card.iconClass} />
        </div>
      )}
    </Link>
  );
}

export function HomeServiceGrid() {
  return (
    <section className="mt-5 space-y-3 overflow-visible" aria-label={uz.categories}>
      {/* Row 1 — horizontal carousel */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-1 scrollbar-hide snap-x snap-mandatory">
        {TOP_CAROUSEL.map((card) => (
          <ServiceTile
            key={card.href + card.title}
            card={card}
            carousel
            iconSize={40}
          />
        ))}
      </div>

      {/* Row 2 — first card wider, like before */}
      <div className="grid grid-cols-[1.65fr_1fr] gap-3 overflow-visible">
        <ServiceTile card={BOTTOM_LARGE} className="min-h-[132px]" iconSize={52} />
        <ServiceTile card={BOTTOM_SMALL} className="min-h-[132px]" iconSize={40} />
      </div>
    </section>
  );
}
