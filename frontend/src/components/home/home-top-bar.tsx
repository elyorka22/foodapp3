'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { uz } from '@/lib/uz';

export function HomeTopBar() {
  return (
    <div className="flex items-center justify-between gap-3 safe-top pt-2">
      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold tracking-wide text-zinc-900">{uz.cityName}</p>
        <p className="text-sm text-zinc-500">{uz.citySubtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label={uz.searchAria}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-card active:scale-95"
        >
          <Search size={20} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label={uz.filterAria}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-card active:scale-95"
        >
          <SlidersHorizontal size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
