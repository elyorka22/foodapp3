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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
      <ul className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          const badge = href === '/cart' && cartCount > 0 ? cartCount : null;
          return (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  'relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs',
                  active ? 'text-brand-600 font-semibold' : 'opacity-60',
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {label}
                {badge != null && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] text-white">
                    {badge}
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
