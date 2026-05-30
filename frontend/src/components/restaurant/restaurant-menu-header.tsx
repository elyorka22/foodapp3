'use client';

import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  title: string;
};

export function RestaurantMenuHeader({ title }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[#F5F5F7]/95 backdrop-blur-md pt-[calc(env(safe-area-inset-top,0px)+8px)]">
      <div className="flex items-center gap-2 px-1 pb-3">
        <Link
          href="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 active:scale-95"
          aria-label={uz.back}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-center text-base font-bold text-zinc-900">
          {title}
        </h1>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 active:scale-95"
          aria-label={uz.searchAria}
        >
          <Search size={20} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
