'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/90 safe-top">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 active:opacity-80">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-600/30">
            F
          </span>
          <div className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-zinc-900 dark:text-white">
              FoodApp
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Delivery
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 transition active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            aria-label="Profile"
          >
            <User size={20} strokeWidth={1.75} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
