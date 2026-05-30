'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, ShoppingBag, User } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { href: '/', label: 'Bosh sahifa', icon: Home },
  { href: '/orders', label: 'Buyurtmalarim', icon: ShoppingBag },
  { href: '/favorites', label: 'Sevimlilar', icon: Heart },
  { href: '/profile', label: 'Profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white safe-bottom"
      aria-label="Asosiy navigatsiya"
    >
      <ul className="mx-auto flex max-w-lg items-end justify-around px-2 pb-1 pt-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-1 py-1 transition active:scale-95',
                  active ? 'text-brand-600' : 'text-zinc-400',
                )}
              >
                <Icon size={24} strokeWidth={active ? 2.25 : 1.75} />
                <span
                  className={clsx(
                    'text-[10px] leading-none',
                    active ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
