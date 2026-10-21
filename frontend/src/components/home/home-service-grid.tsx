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
import { usePublicSettings } from '@/hooks/use-public-settings';
import {
  mergeHomeServiceCard,
  resolveHomeServiceImageUrl,
  type HomeServiceCardKey,
  type HomeServiceCardLayout,
} from '@/lib/home-service-cards';

type ServiceCard = {
  key: HomeServiceCardKey;
  href: string;
  title: string;
  eta: string;
  badge?: { label: string; className: string };
  icon: LucideIcon;
  /** Gray-scale tile wash — mono foundation. */
  tile: string;
  accent: string;
  iconClass: string;
};

/** Row 1 — specialty stores (white/gray tiles). */
const TOP_ROW: ServiceCard[] = [
  {
    key: 'flowers',
    href: '/stores?type=flowers',
    title: uz.homeServiceFlowers,
    eta: uz.homeServiceFlowersEta,
    icon: Flower2,
    tile: 'bg-white',
    accent: 'from-[#E4E4E7] to-[#F4F4F5]',
    iconClass: 'text-zinc-800',
  },
  {
    key: 'cosmetics',
    href: '/stores?type=perfume',
    title: uz.homeServiceCosmetics,
    eta: uz.homeServiceCosmeticsEta,
    icon: Sparkles,
    tile: 'bg-white',
    accent: 'from-[#E4E4E7] to-[#F4F4F5]',
    iconClass: 'text-zinc-800',
  },
  {
    key: 'pharmacy',
    href: '/stores?type=pharmacy',
    title: uz.homeServicePharmacy,
    eta: uz.homeServicePharmacyEta,
    icon: Pill,
    tile: 'bg-white',
    accent: 'from-[#E4E4E7] to-[#F4F4F5]',
    iconClass: 'text-zinc-800',
  },
];

/** Row 2 — restaurants + grocery. */
const BOTTOM_LARGE: ServiceCard = {
  key: 'restaurants',
  href: '/restaurants',
  title: uz.homeServiceRestaurants,
  eta: uz.homeServiceRestaurantsEta,
  badge: { label: uz.homeServiceDeliveryBadge, className: 'bg-zinc-900 text-white' },
  icon: UtensilsCrossed,
  tile: 'bg-white',
  accent: 'from-[#E4E4E7] to-[#F4F4F5]',
  iconClass: 'text-zinc-800',
};

const BOTTOM_SMALL: ServiceCard = {
  key: 'products',
  href: '/stores?type=grocery',
  title: uz.homeServiceProducts,
  eta: uz.homeServiceProductsEta,
  icon: ShoppingBag,
  tile: 'bg-white',
  accent: 'from-[#E4E4E7] to-[#F4F4F5]',
  iconClass: 'text-zinc-800',
};

function ServiceTile({
  card,
  layout,
  className,
  iconSize = 44,
  compact,
}: {
  card: ServiceCard;
  layout: HomeServiceCardLayout;
  className?: string;
  iconSize?: number;
  compact?: boolean;
}) {
  const Icon = card.icon;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(layout.imageUrl) && !imageFailed;

  return (
    <Link
      href={card.href}
      className={clsx(
        'relative block min-h-[118px] rounded-[26px] ring-1 ring-black/[0.04] shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition active:scale-[0.98]',
        compact && 'min-h-[120px]',
        card.tile,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]"
        aria-hidden
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote or static asset with absolute positioning
          <img
            src={resolveHomeServiceImageUrl(layout.imageUrl)}
            alt=""
            loading="eager"
            decoding="async"
            className="absolute object-contain origin-center"
            style={{
              width: `${layout.widthPercent}%`,
              right: layout.right,
              bottom: layout.bottom,
              transform:
                layout.rotate !== 0
                  ? `rotate(${layout.rotate}deg)`
                  : undefined,
            }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={clsx(
              'absolute bottom-1 right-1 flex items-center justify-center rounded-full bg-gradient-to-br',
              compact ? 'h-[56px] w-[56px]' : 'h-[72px] w-[72px]',
              card.accent,
            )}
          >
            <Icon size={iconSize} strokeWidth={1.6} className={card.iconClass} />
          </div>
        )}
      </div>

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
    </Link>
  );
}

export function HomeServiceGrid() {
  const { data: settings } = usePublicSettings();
  const cards = settings?.home_service_cards;

  const layoutFor = (key: HomeServiceCardKey) =>
    mergeHomeServiceCard(key, cards?.[key]);

  return (
    <section className="mt-5 space-y-3" aria-label={uz.categories}>
      {/* Top specialty tiles — horizontal carousel, wider than 1/3 grid. */}
      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-hide">
        {TOP_ROW.map((card) => (
          <ServiceTile
            key={card.key}
            card={card}
            layout={layoutFor(card.key)}
            compact
            iconSize={30}
            className="min-h-[128px] w-[44%] min-w-[10.25rem] shrink-0 snap-start"
          />
        ))}
      </div>

      <div className="grid grid-cols-[1.65fr_1fr] gap-3">
        <ServiceTile
          card={BOTTOM_LARGE}
          layout={layoutFor('restaurants')}
          className="min-h-[132px]"
          iconSize={52}
        />
        <ServiceTile
          card={BOTTOM_SMALL}
          layout={layoutFor('products')}
          className="min-h-[132px]"
          iconSize={40}
        />
      </div>
    </section>
  );
}
