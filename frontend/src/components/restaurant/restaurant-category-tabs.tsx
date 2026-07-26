'use client';

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
    <div className="scrollbar-hide -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'shrink-0 rounded-full border px-4 py-2.5 text-[14px] font-bold transition-colors',
              active
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-500',
            )}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
