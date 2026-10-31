'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { NotificationBell } from '@/components/ui/notification-bell';
import { PwaInstallButton } from '@/components/pwa/pwa-install-button';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
import { usePublicSettings } from '@/hooks/use-public-settings';
import { isCustomerLoggedIn } from '@/lib/customer';
import { uz } from '@/lib/uz';
import { CitySelector } from '@/components/home/city-selector';

export function HomeHeadline() {
  const settings = usePublicSettings();
  const subtitle = settings.data?.home_subtitle?.trim() || uz.citySubtitle;
  const loggedIn = isCustomerLoggedIn();
  const { unread } = useCustomerNotifications();
  const unreadCount = loggedIn ? unread.data?.count ?? 0 : 0;

  return (
    <header className="animate-fade-in pt-[calc(env(safe-area-inset-top,0px)+12px)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CitySelector />
          {settings.isLoading && !settings.data ? (
            <Skeleton className="mt-1.5 h-4 w-40 rounded shadow-none" />
          ) : subtitle ? (
            <p className="mt-1 text-sm font-medium text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PwaInstallButton />
          <NotificationBell
            unreadCount={unreadCount}
            size={22}
            className="bg-white shadow-[0_4px_16px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04]"
          />
        </div>
      </div>
    </header>
  );
}
