'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBasket, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useCartStore } from '@/store/cart';
import { uz } from '@/lib/uz';

const tabs = [
  {
    href: '/',
    label: uz.navHome,
    icon: Home,
    match: (path: string) =>
      path === '/' || path.startsWith('/restaurants/'),
  },
  {
    href: '/cart',
    label: uz.navCart,
    icon: ShoppingBasket,
    match: (path: string) => path === '/cart' || path.startsWith('/checkout'),
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
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const handleNavClick = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === href) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (href === '/') {
      event.preventDefault();
      router.push('/');
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-1px_0_rgba(0,0,0,0.06)]"
      aria-label="Asosiy navigatsiya"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-4 pt-2 pb-2">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          const showBadge = href === '/cart' && cartCount > 0;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                onClick={handleNavClick(href)}
                className={clsx(
                  'relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition active:scale-95',
                  active ? 'text-primary' : 'text-foreground-subtle',
                )}
              >
                <span
                  className={clsx(
                    'flex h-11 w-11 items-center justify-center rounded-2xl transition',
                    active && 'bg-primary-soft',
                  )}
                >
                  <Icon size={24} strokeWidth={active ? 2.25 : 1.75} />
                </span>
                {showBadge && (
                  <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
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
