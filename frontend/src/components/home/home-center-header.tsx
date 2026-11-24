'use client';

import { CitySelector } from '@/components/home/city-selector';
import { NotificationBell } from '@/components/ui/notification-bell';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
import { isCustomerLoggedIn } from '@/lib/customer';

export function HomeCenterHeader({
  onCityOpenChange,
}: {
  onCityOpenChange?: (open: boolean) => void;
}) {
  const loggedIn = isCustomerLoggedIn();
  const { unread } = useCustomerNotifications();
  const unreadCount = loggedIn ? unread.data?.count ?? 0 : 0;

  return (
    <header className="pt-[calc(env(safe-area-inset-top,0px)+10px)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CitySelector className="max-w-full" onOpenChange={onCityOpenChange} />
        </div>
        <NotificationBell unreadCount={unreadCount} size={22} />
      </div>
    </header>
  );
}
