'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { uz } from '@/lib/uz';

export function HomeHeadline() {
  const settings = usePublicSettings();

  if (settings.isLoading) {
    return (
      <header className="pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        </div>
      </header>
    );
  }

  const title = settings.data?.home_title?.trim() || uz.cityName;
  const subtitle = settings.data?.home_subtitle?.trim();

  return (
    <header className="pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-zinc-900">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm font-medium text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href="/notifications"
          aria-label={uz.notificationsAria}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-card transition active:scale-95"
        >
          <Bell size={22} strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}
