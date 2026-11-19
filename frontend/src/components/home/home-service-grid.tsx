'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Flower2,
  Pill,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { clsx } from 'clsx';
import { uz } from '@/lib/uz';
import type { LucideIcon } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { useBusinessTypes } from '@/hooks/use-business-types';
import type { BusinessType } from '@/lib/api/business';
import {
  resolveHomeServiceImageUrl,
  type HomeServiceCardLayout,
} from '@/lib/home-service-cards';
import {
  homeHrefForType,
  isRestaurantHomeType,
  layoutForBusinessType,
  splitHomeGridTypes,
} from '@/lib/home-service-type';
import {
  SECTION_ISLAND_GAP,
  SectionIsland,
} from '@/components/ui/section-island';

/** Shared tile height — top carousel and bottom row must match. */
const TILE_HEIGHT_CLASS = 'h-[132px]';

function iconForType(type: BusinessType): LucideIcon {
  const slug = (type.slug ?? '').toLowerCase();
  if (isRestaurantHomeType(type)) return UtensilsCrossed;
  if (slug === 'flowers') return Flower2;
  if (slug === 'perfume' || slug === 'cosmetics') return Sparkles;
  if (slug === 'pharmacy') return Pill;
  if (slug === 'grocery' || slug === 'products') return ShoppingBag;
  return Store;
}

function ServiceTile({
  type,
  layout,
  className,
  iconSize = 44,
  compact,
  wide,
}: {
  type: BusinessType;
  layout: HomeServiceCardLayout;
  className?: string;
  iconSize?: number;
  compact?: boolean;
  wide?: boolean;
}) {
  const Icon = iconForType(type);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(layout.imageUrl) && !imageFailed;
  const eta = type.description?.trim() || uz.homeServiceProductsEta;
  const badge =
    isRestaurantHomeType(type) && wide
      ? { label: uz.homeServiceDeliveryBadge, className: 'bg-zinc-900 text-white' }
      : null;

  return (
    <Link
      href={homeHrefForType(type)}
      className={clsx(
        'relative block overflow-hidden rounded-[28px] bg-background transition active:scale-[0.98]',
        TILE_HEIGHT_CLASS,
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
                layout.rotate !== 0 ? `rotate(${layout.rotate}deg)` : undefined,
            }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={clsx(
              'absolute bottom-1 right-1 flex items-center justify-center rounded-full bg-gradient-to-br from-[#E4E4E7] to-[#F4F4F5]',
              compact ? 'h-[56px] w-[56px]' : 'h-[72px] w-[72px]',
            )}
          >
            <Icon size={iconSize} strokeWidth={1.6} className="text-zinc-800" />
          </div>
        )}
      </div>

      <div
        className={clsx(
          'relative z-10 flex h-full flex-col',
          compact ? 'p-3' : 'p-3.5',
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
            {type.name}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-zinc-400 sm:text-[12px]">
            {eta}
          </p>
        </div>

        {badge ? (
          <span
            className={clsx(
              'mt-auto inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold',
              badge.className,
            )}
          >
            {badge.label}
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
  const { data: types = [], isLoading } = useBusinessTypes();
  const cards = settings?.home_service_cards;
  const { row1, restaurant, row2Others } = splitHomeGridTypes(types);

  if (!isLoading && types.length === 0) return null;

  // City + bell stay in the header above — outside islands.
  return (
    <SectionIsland className={SECTION_ISLAND_GAP} aria-label={uz.categories}>
      <div className="space-y-2.5">
        {row1.length > 0 ? (
          <div className="-mr-4 flex gap-2.5 overflow-x-auto pr-4 pb-0.5 snap-x snap-mandatory scrollbar-hide">
            {row1.map((type) => (
              <ServiceTile
                key={type.id}
                type={type}
                layout={layoutForBusinessType(type, cards)}
                compact
                iconSize={30}
                className="w-[46%] min-w-[10.5rem] shrink-0 snap-start"
              />
            ))}
          </div>
        ) : null}

        {restaurant || row2Others.length > 0 ? (
          <div
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: restaurant
                ? row2Others.length > 0
                  ? ['1.65fr', ...row2Others.map(() => 'minmax(0,1fr)')].join(' ')
                  : '1fr'
                : row2Others.map(() => 'minmax(0,1fr)').join(' ') || '1fr',
            }}
          >
            {restaurant ? (
              <ServiceTile
                type={restaurant}
                layout={layoutForBusinessType(restaurant, cards)}
                iconSize={52}
                wide
              />
            ) : null}
            {row2Others.map((type) => (
              <ServiceTile
                key={type.id}
                type={type}
                layout={layoutForBusinessType(type, cards)}
                iconSize={40}
              />
            ))}
          </div>
        ) : null}
      </div>
    </SectionIsland>
  );
}
