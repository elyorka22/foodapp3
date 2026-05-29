'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import {
  Coffee,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CategoryChip = {
  id: string;
  name: string;
  slug: string;
};

const ICONS: Record<string, LucideIcon> = {
  pizza: Pizza,
  burger: Sandwich,
  burgers: Sandwich,
  salad: Salad,
  salads: Salad,
  coffee: Coffee,
  soup: Soup,
  default: UtensilsCrossed,
};

function iconForSlug(slug: string): LucideIcon {
  const key = slug.toLowerCase();
  return ICONS[key] ?? ICONS.default;
}

const FALLBACK_CATEGORIES: CategoryChip[] = [
  { id: 'all', name: 'All', slug: 'all' },
  { id: 'pizza', name: 'Pizza', slug: 'pizza' },
  { id: 'burgers', name: 'Burgers', slug: 'burgers' },
  { id: 'sushi', name: 'Sushi', slug: 'sushi' },
  { id: 'healthy', name: 'Healthy', slug: 'healthy' },
  { id: 'desserts', name: 'Desserts', slug: 'desserts' },
];

type Props = {
  categories: CategoryChip[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
};

export function CategoryRow({ categories, activeSlug, onSelect }: Props) {
  const chips =
    categories.length > 0
      ? [{ id: 'all', name: 'All', slug: 'all' }, ...categories]
      : FALLBACK_CATEGORIES;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
      {chips.map((cat) => {
        const Icon = iconForSlug(cat.slug);
        const active = activeSlug === cat.slug || (cat.slug === 'all' && !activeSlug);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.slug === 'all' ? null : cat.slug)}
            className={clsx(
              'flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition active:scale-95',
              active
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                : 'bg-white text-zinc-700 shadow-card dark:bg-zinc-900 dark:text-zinc-200',
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
            <span className="max-w-[4.5rem] truncate text-[11px] font-medium">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Promo tiles from banners without full carousel prominence */
export function PromoTile({
  title,
  imageUrl,
  href,
}: {
  title: string;
  imageUrl?: string | null;
  href?: string;
}) {
  const inner = (
    <div className="relative flex h-24 min-w-[10.5rem] shrink-0 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-orange-400 p-3 shadow-card">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <p className="relative z-10 line-clamp-2 text-sm font-semibold text-white">{title}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block shrink-0 active:scale-[0.98]">
        {inner}
      </Link>
    );
  }
  return <div className="shrink-0">{inner}</div>;
}
