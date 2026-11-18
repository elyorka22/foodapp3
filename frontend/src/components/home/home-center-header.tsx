'use client';

import { clsx } from 'clsx';
import { CitySelector } from '@/components/home/city-selector';
import { NotificationBell } from '@/components/ui/notification-bell';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
import { isCustomerLoggedIn } from '@/lib/customer';

type Props = {
  /** `hero` = light text on brand atmosphere. */
  tone?: 'default' | 'hero';
};

export function HomeCenterHeader({ tone = 'default' }: Props) {
  const loggedIn = isCustomerLoggedIn();
  const { unread } = useCustomerNotifications();
  const unreadCount = loggedIn ? unread.data?.count ?? 0 : 0;
  const onHero = tone === 'hero';

  return (
    <header className={clsx(!onHero && 'pt-[calc(env(safe-area-inset-top,0px)+10px)]')}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CitySelector tone={onHero ? 'hero' : 'default'} className="max-w-full" />
        </div>
        <NotificationBell
          unreadCount={unreadCount}
          size={22}
          className={
            onHero
              ? 'bg-white/95 text-zinc-900 shadow-[0_4px_16px_rgba(15,23,42,0.12)] active:bg-white'
              : undefined
          }
        />
      </div>
    </header>
  );
}
