'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';

export type CatalogCategoryTile = {
  id: string;
  name: string;
  href: string;
  imageUrl?: string | null;
};

type Props = {
  title: string;
  categories: CatalogCategoryTile[];
  tone?: 'peach' | 'mint' | 'sky' | 'lilac';
  /** Optional “see all” tile at the end of the grid. */
  allHref?: string;
  allLabel?: string;
};

const TONE_BG: Record<NonNullable<Props['tone']>, string[]> = {
  peach: ['bg-[#F6E8DC]', 'bg-[#F8E4D4]', 'bg-[#F3DFD0]'],
  mint: ['bg-[#E4F0E2]', 'bg-[#DCECD8]', 'bg-[#E8F3E6]'],
  sky: ['bg-[#E4EEF7]', 'bg-[#DCE7F2]', 'bg-[#E8F1F8]'],
  lilac: ['bg-[#EEE6F3]', 'bg-[#E8DFF0]', 'bg-[#F2EAF6]'],
};

export function CategoryTileGrid({
  title,
  categories,
  tone = 'peach',
  allHref,
  allLabel = uz.storeAllCategories,
}: Props) {
  if (categories.length === 0) return null;
  const palette = TONE_BG[tone];

  return (
    <section className="mt-5">
      <h2 className="mb-3 text-[20px] font-extrabold tracking-tight text-zinc-900">
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat, index) => {
          const img = resolveImageUrl(cat.imageUrl);
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={clsx(
                'relative aspect-[5/4] overflow-hidden rounded-[16px] text-left transition active:scale-[0.98]',
                palette[index % palette.length],
              )}
            >
              <span className="absolute left-2.5 top-2 z-10 line-clamp-2 max-w-[88%] text-[12px] font-bold leading-tight text-zinc-900">
                {cat.name}
              </span>
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt=""
                  className="pointer-events-none absolute -bottom-1 -right-1 h-[72%] w-[72%] object-contain object-bottom-right"
                />
              ) : (
                <span className="pointer-events-none absolute bottom-1 right-2 text-[28px] font-black text-zinc-900/15">
                  {cat.name.trim().charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
          );
        })}
        {allHref ? (
          <Link
            href={allHref}
            className={clsx(
              'relative flex aspect-[5/4] flex-col items-start justify-between overflow-hidden rounded-[16px] p-2.5 text-left transition active:scale-[0.98]',
              palette[0],
            )}
          >
            <span className="line-clamp-2 text-[12px] font-bold leading-tight text-zinc-900">
              {allLabel}
            </span>
            <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm">
              <ArrowRight size={16} strokeWidth={2.5} />
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
