'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { CitySelector } from '@/components/home/city-selector';
import { HomeSideMenu } from '@/components/home/home-side-menu';
import { useCustomerNotifications } from '@/hooks/use-customer-notifications';
import { isCustomerLoggedIn } from '@/lib/customer';
import { uz } from '@/lib/uz';

export function HomeCenterHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loggedIn = isCustomerLoggedIn();
  const { unread } = useCustomerNotifications();
  const unreadCount = loggedIn ? unread.data?.count ?? 0 : 0;

  return (
    <>
      <header className="pt-[calc(env(safe-area-inset-top,0px)+10px)]">
        <div className="relative flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label={uz.openMenu}
            onClick={() => setMenuOpen(true)}
            className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-900 transition active:scale-95 active:bg-zinc-100"
          >
            <Menu size={24} strokeWidth={2.25} />
          </button>

          <div className="absolute inset-x-12 flex flex-col items-center justify-center text-center">
            <CitySelector className="home-city-center max-w-full justify-center" />
          </div>

          <Link
            href="/notifications"
            aria-label={uz.notificationsAria}
            className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-900 transition active:scale-95 active:bg-zinc-100"
          >
            <Bell size={22} strokeWidth={2} />
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            ) : null}
          </Link>
        </div>
      </header>

      <HomeSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
