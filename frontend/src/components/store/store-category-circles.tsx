'use client';

import { LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { uz } from '@/lib/uz';

export type StoreCategory = {
  id: string;
  name: string;
};

type Props = {
  categories: StoreCategory[];
  activeId: string;
  onChange: (id: string) => void;
};

const CIRCLE_COLORS = [
  'bg-[#EEF2FF]',
  'bg-[#ECFDF5]',
  'bg-[#FFF7ED]',
  'bg-[#FDF2F8]',
  'bg-[#F0F9FF]',
  'bg-[#FEF3C7]',
  'bg-[#F5F3FF]',
] as const;

export function StoreCategoryCircles({
  categories,
  activeId,
  onChange,
}: Props) {
  const visible = categories.slice(0, 7);
  const items: Array<StoreCategory & { all?: boolean }> = [
    ...visible,
    { id: 'all', name: uz.storeAllCategories, all: true },
  ];

  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-3">
      {items.map((cat, index) => {
        const active = activeId === cat.id;
        return (
          <button
            key={cat.id === 'all' ? 'all-cats' : cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className="flex flex-col items-center gap-1.5 active:scale-[0.97]"
          >
            <span
              className={clsx(
                'flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full transition',
                cat.all ? 'bg-zinc-100' : CIRCLE_COLORS[index % CIRCLE_COLORS.length],
                active && 'ring-2 ring-brand-600 ring-offset-2',
              )}
            >
              {cat.all ? (
                <LayoutGrid size={22} className="text-zinc-700" strokeWidth={2} />
              ) : (
                <span className="text-[22px] font-black text-zinc-700/80">
                  {cat.name.trim().charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <span className="line-clamp-2 max-w-[4.5rem] text-center text-[11px] font-semibold leading-tight text-zinc-700">
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
