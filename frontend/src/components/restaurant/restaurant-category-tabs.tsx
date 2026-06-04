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
    <div className="scrollbar-hide -mx-1 mb-4 flex gap-5 overflow-x-auto border-b border-zinc-200/80 px-1 pb-0">
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'shrink-0 pb-2.5 text-[15px] font-semibold transition-colors',
              active ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400',
            )}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
