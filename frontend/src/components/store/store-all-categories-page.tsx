'use client';

import { ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import { uz } from '@/lib/uz';
import type { StoreCategory } from '@/components/store/store-category-circles';

type Props = {
  categories: StoreCategory[];
  onBack: () => void;
  onSelect: (id: string) => void;
};

export function StoreAllCategoriesPage({
  categories,
  onBack,
  onSelect,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-[#F4F4F5]">
      <header className="sticky top-0 z-10 bg-[#F4F4F5]/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+8px)] backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full active:bg-zinc-200/70"
            aria-label={uz.back}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <h1 className="text-[20px] font-extrabold tracking-tight text-zinc-900">
            {uz.categories}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-1">
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onSelect('all')}
            className="relative aspect-[1/1.05] overflow-hidden rounded-[20px] bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.98]"
          >
            <p className="relative z-10 line-clamp-3 p-2.5 pr-8 text-[13px] font-bold leading-snug text-zinc-900">
              {uz.storeAllCategories}
            </p>
            <span className="pointer-events-none absolute -bottom-1 -right-1 h-[70%] w-[70%] rounded-tl-[28px] bg-gradient-to-br from-zinc-200 to-zinc-100" />
          </button>

          {categories.map((cat) => {
            const img = resolveImageUrl(cat.imageUrl);
            const framing = categoryImageStyle(
              {
                imageScale: cat.imageScale ?? 110,
                imagePositionX: cat.imagePositionX,
                imagePositionY: cat.imagePositionY,
              },
              { fit: 'contain' },
            );
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id)}
                className="relative aspect-[1/1.05] overflow-hidden rounded-[20px] bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.98]"
              >
                <p className="relative z-10 line-clamp-3 p-2.5 pr-8 text-[13px] font-bold leading-snug text-zinc-900">
                  {cat.name}
                </p>
                {img ? (
                  <div
                    className="pointer-events-none absolute -bottom-2 -right-2 h-[72%] w-[72%]"
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
                  <span
                    className={clsx(
                      'pointer-events-none absolute -bottom-1 -right-1 flex h-[55%] w-[55%] items-center justify-center rounded-tl-[24px] bg-zinc-100 text-2xl font-black text-zinc-300',
                    )}
                  >
                    {cat.name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
