'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
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
} from '@/lib/home-service-type';
/** Cards inside the home island — same height on both rows. */
const TILE_HEIGHT_CLASS = 'h-[112px]';

function SlidingTitle({ text, className }: { text: string; className?: string }) {
  const clipRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [slides, setSlides] = useState(false);

  useEffect(() => {
    const clip = clipRef.current;
    const measure = measureRef.current;
    if (!clip || !measure) return;

    const update = () => {
      setSlides(measure.scrollWidth > clip.clientWidth + 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(clip);
    return () => observer.disconnect();
  }, [text]);

  return (
    <p ref={clipRef} className={clsx('relative overflow-hidden', className)}>
      <span
        ref={measureRef}
        className="pointer-events-none absolute whitespace-nowrap opacity-0"
        aria-hidden
      >
        {text}
      </span>
      <span
        className={clsx(
          'inline-flex w-max whitespace-nowrap',
          slides && 'category-title-slide',
        )}
        style={
          slides ? { animationDuration: `${Math.max(5, text.length * 0.28)}s` } : undefined
        }
      >
        <span className={slides ? 'pr-8' : undefined}>{text}</span>
        {slides ? (
          <span className="pr-8" aria-hidden>
            {text}
          </span>
        ) : null}
      </span>
    </p>
  );
}

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
        'relative block overflow-hidden rounded-[22px] bg-white transition active:scale-[0.98]',
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
          <SlidingTitle
            text={type.name}
            className={clsx(
              'font-bold leading-tight text-zinc-900',
              compact ? 'text-[12px] sm:text-[13px]' : 'text-[13px] sm:text-[15px]',
            )}
          />
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

function slugOf(type: BusinessType) {
  return (type.slug ?? '').toLowerCase();
}

export function HomeServiceGrid() {
  const { data: settings } = usePublicSettings();
  const { data: types = [], isLoading } = useBusinessTypes();
  const cards = settings?.home_service_cards;

  const restaurant = types.find((type) => isRestaurantHomeType(type)) ?? null;
  const grocery =
    types.find((type) => {
      const slug = slugOf(type);
      return slug === 'grocery' || slug === 'products';
    }) ?? null;
  const flowers = types.find((type) => slugOf(type) === 'flowers') ?? null;
  const perfume =
    types.find((type) => {
      const slug = slugOf(type);
      return slug === 'perfume' || slug === 'cosmetics';
    }) ?? null;

  const row1 = [restaurant, grocery].filter((type): type is BusinessType => Boolean(type));
  const row2 = [flowers, perfume].filter((type): type is BusinessType => Boolean(type));

  if (!isLoading && row1.length === 0 && row2.length === 0) return null;

  return (
    <section className="space-y-2.5" aria-label={uz.categories}>
      {row1.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {row1.map((type) => (
            <ServiceTile
              key={type.id}
              type={type}
              layout={layoutForBusinessType(type, cards)}
              compact
              wide={isRestaurantHomeType(type)}
              iconSize={28}
            />
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2.5">
        {row2.map((type) => (
          <ServiceTile
            key={type.id}
            type={type}
            layout={layoutForBusinessType(type, cards)}
            compact
            iconSize={26}
          />
        ))}
        <Link
          href="/stores"
          className="flex h-[112px] flex-col rounded-[22px] bg-white p-3 transition active:scale-[0.98]"
        >
          <SlidingTitle
            text={uz.storeAllCategories}
            className="text-[13px] font-bold leading-tight text-zinc-900"
          />
          <span className="mt-auto flex h-8 w-8 items-center justify-center rounded-full bg-background text-zinc-800">
            <ArrowRight size={16} strokeWidth={2.25} />
          </span>
        </Link>
      </div>
    </section>
  );
}
