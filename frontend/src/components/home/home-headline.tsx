'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PwaInstallButton } from '@/components/pwa/pwa-install-button';
import { TelegramSocialButton } from '@/components/home/telegram-social-button';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { uz } from '@/lib/uz';
import { CitySelector } from '@/components/home/city-selector';

export function HomeHeadline() {
  const settings = usePublicSettings();

  if (settings.isLoading) {
    return (
      <header className="pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-9 w-48 rounded-lg" />
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        </div>
        </div>
      </header>
    );
  }

  const subtitle = settings.data?.home_subtitle?.trim() || uz.citySubtitle;

  return (
    <header className="pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CitySelector />
          {subtitle ? (
            <p className="mt-1 text-sm font-medium text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TelegramSocialButton />
          <PwaInstallButton />
          <Link
            href="/notifications"
            aria-label={uz.notificationsAria}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-800 shadow-card transition active:scale-95"
          >
            <Bell size={22} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
