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

/** Row 1 — specialty store categories (business type slugs from seed). */
const TOP_ROW: ServiceCard[] = [
  {
    href: '/stores?type=flowers',
    title: uz.homeServiceFlowers,
    eta: uz.homeServiceFlowersEta,
    icon: Flower2,
    accent: 'from-[#FCE7F3] to-[#FDF2F8]',
    iconClass: 'text-pink-600',
  },
  {
    // Seed slug is `perfume` (Parfyumeriya); UI label is Kosmetika.
    href: '/stores?type=perfume',
    title: uz.homeServiceCosmetics,
    eta: uz.homeServiceCosmeticsEta,
    icon: Sparkles,
    accent: 'from-[#F3E8FF] to-[#FAF5FF]',
    iconClass: 'text-violet-600',
  },
  {
    href: '/stores?type=pharmacy',
    title: uz.homeServicePharmacy,
    eta: uz.homeServicePharmacyEta,
    icon: Pill,
    accent: 'from-[#DCFCE7] to-[#F0FDF4]',
    iconClass: 'text-emerald-600',
  },
];

/** Row 2 — large restaurants + products (grocery marketplace). */
const BOTTOM_LARGE: ServiceCard = {
  href: '/restaurants',
  title: uz.homeServiceRestaurants,
  eta: uz.homeServiceRestaurantsEta,
  badge: { label: uz.homeServiceDeliveryBadge, tone: 'orange' },
  icon: UtensilsCrossed,
  accent: 'from-[#E4E4E7] to-[#F4F4F5]',
  iconClass: 'text-zinc-800',
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
  accent: 'from-[#E8F5E9] to-[#F1F8F2]',
  iconClass: 'text-emerald-600',
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
  /** Equal-width top-row tiles */
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
        className="absolute inset-0 rounded-[26px] bg-[#F5F0EF] shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
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
          <p className="mt-0.5 text-[11px] font-medium text-zinc-400 sm:text-[12px]">
            {card.eta}
          </p>
        </div>

        {card.badge ? (
          <span
            className={clsx(
              'mt-auto inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold text-white',
              card.badge.tone === 'orange' ? 'bg-primary' : 'bg-sky-500',
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
            'pointer-events-none absolute -bottom-1 -right-1 z-[5] flex items-center justify-center rounded-full bg-gradient-to-br opacity-95',
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
      {/* Row 1 — Gullar · Kosmetika · Dorixona */}
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

      {/* Row 2 — Restoranlar (wide) + Mahsulotlar */}
      <div className="grid grid-cols-[1.65fr_1fr] gap-3 overflow-visible">
        <ServiceTile card={BOTTOM_LARGE} className="min-h-[132px]" iconSize={52} />
        <ServiceTile card={BOTTOM_SMALL} className="min-h-[132px]" iconSize={40} />
      </div>
    </section>
  );
}
