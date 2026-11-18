'use client';

import { ChevronLeft } from 'lucide-react';
import { uz } from '@/lib/uz';
import {
  StoreCategoryGrid,
  type StoreCategory,
} from '@/components/store/store-category-grid';

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
        <StoreCategoryGrid
          categories={categories}
          showAllProductsTile
          onSelectCategory={onSelect}
        />
      </div>
    </div>
  );
}
