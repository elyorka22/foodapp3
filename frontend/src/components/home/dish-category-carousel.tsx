'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import type { DishCategory } from '@/hooks/use-dish-categories';

type Props = {
  categories: DishCategory[];
  activeSlug?: string;
};

/** Horizontal pill chips for dish categories. */
export function DishCategoryCarousel({ categories, activeSlug }: Props) {
  const slides = categories.filter((c) => c.isActive !== false);
  if (!slides.length) return null;

  return (
    <div
      className="-mr-4 flex gap-2 overflow-x-auto pb-1 pr-4 scrollbar-hide"
      aria-label="Taom kategoriyalari"
    >
      {slides.map((cat) => {
        const active = activeSlug != null && activeSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={`/categories/${encodeURIComponent(cat.slug)}`}
            className={clsx(
              'shrink-0 rounded-full border px-4 py-2.5 text-[14px] font-bold transition active:scale-[0.98]',
              active
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-900',
            )}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
