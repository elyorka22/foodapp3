'use client';

import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getCustomer } from '@/lib/customer';

export function HomeTopBar() {
  const customer = getCustomer();
  const initial = customer?.fullName?.charAt(0)?.toUpperCase() ?? 'F';

  return (
    <div className="flex items-center gap-3 safe-top pt-2">
      <Link
        href="/profile"
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-md ring-2 ring-white"
        aria-label="Profil"
      >
        {initial}
      </Link>

      <div className="min-w-0 flex-1 text-center">
        <p className="text-[15px] font-bold tracking-wide text-zinc-900">TOSHKENT</p>
        <p className="text-xs text-zinc-500">shahri bo&apos;ylab</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Qidiruv"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:scale-95"
        >
          <Search size={20} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Filtr"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:scale-95"
        >
          <SlidersHorizontal size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
