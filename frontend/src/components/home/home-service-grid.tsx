'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Flower2,
  Pill,
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
  widthPercent: number;
  right: number;
  bottom: number;
};

type ServiceCard = {
  href: string;
  title: string;
  eta: string;
  badge?: { label: string; className: string };
  icon: LucideIcon;
  /** Full tile wash — each category gets its own hue (X5-style variety). */
  tile: string;
  accent: string;
  iconClass: string;
  image?: ImageLayout;
};

/** Row 1 — specialty stores: pink / violet / green, not one brand color. */
const TOP_ROW: ServiceCard[] = [
  {
    href: '/stores?type=flowers',
    title: uz.homeServiceFlowers,
    eta: uz.homeServiceFlowersEta,
    icon: Flower2,
    tile: 'bg-[#FFE4EC]',
    accent: 'from-[#FB7185] to-[#FDA4AF]',
    iconClass: 'text-white',
  },
  {
    href: '/stores?type=perfume',
    title: uz.homeServiceCosmetics,
    eta: uz.homeServiceCosmeticsEta,
    icon: Sparkles,
    tile: 'bg-[#EDE4FF]',
    accent: 'from-[#A78BFA] to-[#C4B5FD]',
    iconClass: 'text-white',
  },
  {
    href: '/stores?type=pharmacy',
    title: uz.homeServicePharmacy,
    eta: uz.homeServicePharmacyEta,
    icon: Pill,
    tile: 'bg-[#DCFCE7]',
    accent: 'from-[#34D399] to-[#6EE7B7]',
    iconClass: 'text-white',
  },
];

/** Row 2 — restaurants (warm amber) + grocery (lime), Tomato only on CTA badge. */
const BOTTOM_LARGE: ServiceCard = {
  href: '/restaurants',
  title: uz.homeServiceRestaurants,
  eta: uz.homeServiceRestaurantsEta,
  badge: { label: uz.homeServiceDeliveryBadge, className: 'bg-primary text-white' },
  icon: UtensilsCrossed,
  tile: 'bg-[#FFEDD5]',
  accent: 'from-[#FB923C] to-[#FDBA74]',
  iconClass: 'text-white',
  image: {
    src: '/assets/home-services/restaurants.webp',
    widthPercent: 48,
    right: -10,
    bottom: -14,
  },
};

const BOTTOM_SMALL: ServiceCard = {
  href: '/stores?type=grocery',
  title: uz.homeServiceProducts,
  eta: uz.homeServiceProductsEta,
  icon: ShoppingBag,
  tile: 'bg-[#ECFCCB]',
  accent: 'from-[#84CC16] to-[#A3E635]',
  iconClass: 'text-white',
};

function ServiceTile({
  card,
  className,
  iconSize = 44,
  compact,
}: {
  card: ServiceCard;
  className?: string;
  iconSize?: number;
  compact?: boolean;
}) {
  const Icon = card.icon;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(card.image?.src) && !imageFailed;

  return (
    <Link
      href={card.href}
      className={clsx(
        'relative block min-h-[118px] overflow-visible transition active:scale-[0.98]',
        compact && 'min-h-[120px]',
        className,
      )}
    >
      <div
        className={clsx(
          'absolute inset-0 rounded-[26px] shadow-[0_2px_12px_rgba(15,23,42,0.05)]',
          card.tile,
        )}
        aria-hidden
      />

      <div
        className={clsx(
          'relative z-10 flex h-full flex-col p-3.5',
          compact ? 'min-h-[120px] p-3' : 'min-h-[118px]',
        )}
      >
        <div
          className={clsx(
            'min-w-0 pr-1',
            compact ? 'max-w-[78%]' : 'max-w-[62%]',
          )}
        >
          <p
            className={clsx(
              'line-clamp-2 font-bold leading-tight text-zinc-900',
              compact ? 'text-[12px] sm:text-[13px]' : 'text-[13px] sm:text-[15px]',
            )}
          >
            {card.title}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-zinc-500 sm:text-[12px]">
            {card.eta}
          </p>
        </div>

        {card.badge ? (
          <span
            className={clsx(
              'mt-auto inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold',
              card.badge.className,
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
            'pointer-events-none absolute -bottom-1 -right-1 z-[5] flex items-center justify-center rounded-full bg-gradient-to-br shadow-sm',
            compact ? 'h-[56px] w-[56px]' : 'h-[72px] w-[72px]',
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
      <div className="grid grid-cols-3 gap-2.5 overflow-visible">
        {TOP_ROW.map((card) => (
          <ServiceTile
            key={card.href + card.title}
            card={card}
            compact
            iconSize={28}
          />
        ))}
      </div>

      <div className="grid grid-cols-[1.65fr_1fr] gap-3 overflow-visible">
        <ServiceTile card={BOTTOM_LARGE} className="min-h-[132px]" iconSize={52} />
        <ServiceTile card={BOTTOM_SMALL} className="min-h-[132px]" iconSize={40} />
      </div>
    </section>
  );
}
