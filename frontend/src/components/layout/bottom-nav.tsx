'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useCartStore } from '@/store/cart';

const items = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 safe-bottom"
      aria-label="Main navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5 pb-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
          const badge = href === '/cart' && cartCount > 0 ? cartCount : null;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  'relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 transition active:scale-95',
                  active
                    ? 'text-brand-600'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
                )}
              >
                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition',
                    active && 'bg-brand-50 dark:bg-brand-950/50',
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                </span>
                <span
                  className={clsx(
                    'text-[10px] font-medium leading-none',
                    active && 'font-semibold',
                  )}
                >
                  {label}
                </span>
                {badge != null && (
                  <span className="absolute right-3 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white shadow-sm">
                    {badge > 99 ? '99+' : badge}
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
