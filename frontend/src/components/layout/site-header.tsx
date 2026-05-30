'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { uz } from '@/lib/uz';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/95 backdrop-blur-md safe-top">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 active:opacity-80">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-600/30">
            F
          </span>
          <div className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-zinc-900">
              {uz.appTitle}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {uz.appSubtitle}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 active:scale-95"
            aria-label={uz.navProfile}
          >
            <User size={20} strokeWidth={1.75} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
