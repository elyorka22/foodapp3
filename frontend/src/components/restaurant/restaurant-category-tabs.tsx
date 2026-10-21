'use client';

import { Menu } from 'lucide-react';
import { clsx } from 'clsx';

export type MenuCategory = {
  id: string;
  name: string;
};

type Props = {
  categories: MenuCategory[];
  activeId: string;
  onChange: (id: string) => void;
  allLabel?: string;
};

export function RestaurantCategoryTabs({
  categories,
  activeId,
  onChange,
  allLabel = 'Hammasi',
}: Props) {
  if (categories.length === 0) return null;

  const tabs = [{ id: 'all', name: allLabel }, ...categories];

  return (
    <div className="scrollbar-hide sticky top-0 z-20 -mx-3 mb-4 flex items-center gap-2 overflow-x-auto bg-background/95 px-3 py-2.5 backdrop-blur-md">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"
        aria-hidden
      >
        <Menu size={18} strokeWidth={2.25} />
      </span>
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'shrink-0 rounded-full px-3.5 py-2 text-[14px] font-bold transition-colors',
              active
                ? 'bg-brand-600 text-white'
                : 'bg-transparent text-zinc-600 active:bg-zinc-100',
            )}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
