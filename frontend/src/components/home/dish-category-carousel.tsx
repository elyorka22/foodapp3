'use client';

import Image from 'next/image';
import Link from 'next/link';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import type { DishCategory } from '@/hooks/use-dish-categories';

/** Horizontal image cards for dish categories. */
export function DishCategoryCarousel({ categories }: { categories: DishCategory[] }) {
  const slides = categories.filter((c) => c.isActive !== false);
  if (!slides.length) return null;

  return (
    <div
      className="flex h-full gap-2 overflow-x-auto scrollbar-hide"
      aria-label="Taom kategoriyalari"
    >
      {slides.map((cat) => {
        const imageUrl = resolveImageUrl(cat.imageUrl);
        const href = `/categories/${encodeURIComponent(cat.slug)}`;
        return (
          <Link
            key={cat.id}
            href={href}
            className="flex w-[88px] shrink-0 flex-col active:scale-[0.98]"
            aria-label={cat.name}
          >
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[20px] bg-zinc-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={cat.name}
                  fill
                  sizes="88px"
                  className="object-cover"
                  style={categoryImageStyle(cat)}
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-orange-400 px-2 text-center text-xs font-semibold text-white">
                  {cat.name}
                </div>
              )}
            </div>
            <p className="mt-1.5 truncate text-center text-xs font-semibold text-zinc-800">
              {cat.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
