'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Apple, ShoppingBasket, User, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';
import { useCartStore } from '@/store/cart';
import { uz } from '@/lib/uz';

const tabs = [
  {
    href: '/',
    label: uz.navRestaurants,
    icon: UtensilsCrossed,
    match: (path: string) =>
      path === '/' || path.startsWith('/restaurants/'),
  },
  {
    href: '/shops',
    label: uz.navShops,
    icon: Apple,
    match: (path: string) => path === '/shops' || path.startsWith('/shops/'),
  },
  {
    href: '/cart',
    label: uz.navCart,
    icon: ShoppingBasket,
    match: (path: string) => path === '/cart' || path === '/checkout',
  },
  {
    href: '/profile',
    label: uz.navProfile,
    icon: User,
    match: (path: string) =>
      path === '/profile' ||
      path === '/orders' ||
      path === '/favorites' ||
      path === '/notifications',
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-1px_0_rgba(0,0,0,0.06)]"
      aria-label="Asosiy navigatsiya"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-2 pb-2">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          const showBadge = href === '/cart' && cartCount > 0;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  'relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition active:scale-95',
                  active ? 'text-primary' : 'text-foreground-subtle',
                )}
              >
                <span
                  className={clsx(
                    'flex h-9 w-9 items-center justify-center rounded-2xl transition',
                    active && 'bg-primary-soft',
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                </span>
                <span
                  className={clsx(
                    'text-[10px] leading-tight',
                    active ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {label}
                </span>
                {showBadge && (
                  <span className="absolute right-2 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
