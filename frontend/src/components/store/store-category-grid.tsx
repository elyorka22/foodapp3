'use client';

import { clsx } from 'clsx';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';

export type StoreCategory = {
  id: string;
  name: string;
  imageUrl?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
};

export function StoreCategoryTile({
  title,
  imageUrl,
  imageScale,
  imagePositionX,
  imagePositionY,
  onClick,
  gradient,
  active,
}: {
  title: string;
  imageUrl?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  onClick: () => void;
  gradient?: boolean;
  active?: boolean;
}) {
  const img = resolveImageUrl(imageUrl);
  const framing = categoryImageStyle(
    {
      imageScale: imageScale ?? 100,
      imagePositionX,
      imagePositionY,
    },
    { fit: 'contain' },
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'relative aspect-[1/1.05] overflow-hidden rounded-[20px] bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition active:scale-[0.98]',
        active ? 'ring-2 ring-zinc-900 ring-offset-2' : null,
      )}
    >
      {gradient ? (
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200" />
      ) : img ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            transform: framing.transform,
            transformOrigin: framing.transformOrigin,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt=""
            className="h-full w-full object-contain"
            style={{ objectPosition: framing.objectPosition }}
          />
        </div>
      ) : (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-50 text-3xl font-black text-zinc-300">
          {title.trim().charAt(0).toUpperCase()}
        </span>
      )}
      <p className="absolute left-2.5 right-2.5 top-3 z-10 line-clamp-3 text-[13px] font-bold leading-snug text-zinc-900">
        {title}
      </p>
    </button>
  );
}

type GridProps = {
  categories: StoreCategory[];
  /** Preview on store menu: show at most this many category tiles. */
  limit?: number;
  activeId?: string;
  onSelectCategory: (id: string) => void;
  /** When set, shows “all categories” tile that opens the full list. */
  onOpenAll?: () => void;
  /** Full-page mode: “all products” tile selecting id `all`. */
  showAllProductsTile?: boolean;
};

export function StoreCategoryGrid({
  categories,
  limit,
  activeId,
  onSelectCategory,
  onOpenAll,
  showAllProductsTile,
}: GridProps) {
  const visible =
    typeof limit === 'number' ? categories.slice(0, limit) : categories;

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {showAllProductsTile ? (
        <StoreCategoryTile
          title={uz.allCategoryProducts}
          gradient
          active={activeId === 'all'}
          onClick={() => onSelectCategory('all')}
        />
      ) : null}
      {visible.map((cat) => (
        <StoreCategoryTile
          key={cat.id}
          title={cat.name}
          imageUrl={cat.imageUrl}
          imageScale={cat.imageScale}
          imagePositionX={cat.imagePositionX}
          imagePositionY={cat.imagePositionY}
          active={activeId === cat.id}
          onClick={() => onSelectCategory(cat.id)}
        />
      ))}
      {onOpenAll ? (
        <StoreCategoryTile
          title={uz.storeAllCategories}
          gradient
          onClick={onOpenAll}
        />
      ) : null}
    </div>
  );
}
