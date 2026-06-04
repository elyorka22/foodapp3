'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, Search } from 'lucide-react';
import { uz } from '@/lib/uz';

type Props = {
  title: string;
  backHref?: string;
};

export function RestaurantMenuHeader({ title, backHref = '/' }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[#F5F5F7]/95 backdrop-blur-md pt-[calc(env(safe-area-inset-top,0px)+8px)]">
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <Link
          href={backHref}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm active:scale-95"
          aria-label={uz.back}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm active:scale-95"
            aria-label={uz.searchAria}
          >
            <Search size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-800 shadow-sm active:scale-95"
            aria-label={uz.favoritesAria}
          >
            <Heart size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
      <h1 className="px-1 pb-3 text-[26px] font-bold leading-tight tracking-tight text-zinc-900">
        {title}
      </h1>
    </header>
  );
}
