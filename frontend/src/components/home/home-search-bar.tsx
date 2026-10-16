'use client';

import { Search, X } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

export function HomeSearchBar({ value = '', onChange, placeholder }: Props) {
  return (
    <div className="mt-4 flex h-12 items-center gap-2.5 rounded-2xl bg-white px-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] transition focus-within:ring-primary/25">
      <Search size={18} className="shrink-0 text-primary" strokeWidth={2.25} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? uz.searchPlaceholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400"
        aria-label={uz.searchAria}
      />
      {value ? (
        <button
          type="button"
          aria-label={uz.clear}
          onClick={() => onChange?.('')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition active:bg-zinc-100"
        >
          <X size={16} strokeWidth={2.25} />
        </button>
      ) : null}
    </div>
  );
}
