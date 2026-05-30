'use client';

import Link from 'next/link';
import { Bell, Heart } from 'lucide-react';
import { uz } from '@/lib/uz';

function HeaderIconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-card transition active:scale-95"
    >
      {children}
    </Link>
  );
}

export function HomeTopBar() {
  return (
    <header className="pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[22px] font-bold leading-tight tracking-tight text-zinc-900">
            {uz.cityName}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">{uz.citySubtitle}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderIconButton href="/favorites" label={uz.favoritesAria}>
            <Heart size={20} strokeWidth={2} />
          </HeaderIconButton>
          <HeaderIconButton href="/notifications" label={uz.notificationsAria}>
            <Bell size={20} strokeWidth={2} />
          </HeaderIconButton>
        </div>
      </div>
    </header>
  );
}
