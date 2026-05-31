'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export function HomeSearchBar({ value = '', onChange }: Props) {
  return (
    <div className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-white px-3 shadow-sm">
      <Search size={17} className="shrink-0 text-zinc-400" strokeWidth={2} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={uz.searchPlaceholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        aria-label={uz.searchAria}
      />
      <button
        type="button"
        aria-label={uz.filterAria}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 active:bg-zinc-100"
      >
        <SlidersHorizontal size={17} strokeWidth={2} />
      </button>
    </div>
  );
}
