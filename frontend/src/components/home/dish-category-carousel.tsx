'use client';

import Image from 'next/image';
import Link from 'next/link';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import type { DishCategory } from '@/hooks/use-dish-categories';

export function DishCategoryCarousel({ categories }: { categories: DishCategory[] }) {
  if (!categories.length) return null;

  return (
    <section aria-label="Taom kategoriyalari">
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {categories.map((cat) => {
          const imageUrl = resolveImageUrl(cat.imageUrl);
          const href = `/categories/${encodeURIComponent(cat.slug)}`;
          return (
            <Link
              key={cat.id}
              href={href}
              className="block w-[7.5rem] shrink-0 active:scale-[0.98]"
              aria-label={cat.name}
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 shadow-card">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cat.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                    style={categoryImageStyle(cat)}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-orange-400 px-2 text-center text-sm font-semibold text-white">
                    {cat.name}
                  </div>
                )}
              </div>
              <p className="mt-1.5 truncate text-center text-xs font-medium text-zinc-800">{cat.name}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
