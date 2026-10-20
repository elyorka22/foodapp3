'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useCartStore } from '@/store/cart';
import { uz } from '@/lib/uz';

type TabIconProps = {
  active: boolean;
};

/** Solid-friendly icons: tomato when active, gray outline when idle. */
const ACTIVE = '#E11D48';
const IDLE = '#A8A29E';
const ICON = 26;

function HomeIcon({ active }: TabIconProps) {
  if (active) {
    return (
      <svg width={ICON} height={ICON} viewBox="0 0 24 24" aria-hidden>
        <path
          fill={ACTIVE}
          d="M12 3.2 3.5 10.2c-.4.3-.5.8-.3 1.2.1.3.4.5.7.5H5v7.3c0 .9.7 1.6 1.6 1.6H9.2c.4 0 .8-.4.8-.8V15c0-.7.5-1.2 1.2-1.2h1.6c.7 0 1.2.5 1.2 1.2v4.8c0 .4.3.8.8.8h2.6c.9 0 1.6-.7 1.6-1.6V11.9h1.1c.3 0 .6-.2.7-.5.2-.4.1-.9-.3-1.2L12 3.2Z"
        />
      </svg>
    );
  }
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-5.2a1.3 1.3 0 0 0-1.3-1.3h-1a1.3 1.3 0 0 0-1.3 1.3V21H5a1 1 0 0 1-1-1v-9.5Z"
        stroke={IDLE}
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon({ active }: TabIconProps) {
  if (active) {
    return (
      <svg width={ICON} height={ICON} viewBox="0 0 24 24" aria-hidden>
        <path
          fill={ACTIVE}
          d="M7.2 6h13.1c.7 0 1.2.7 1 1.3l-1.5 5.2a2 2 0 0 1-1.9 1.4H9.1a2 2 0 0 1-1.9-1.4L5.2 4.8H3.2a1 1 0 1 1 0-2h2.6c.4 0 .8.3.9.7L7.2 6Zm1.3 13.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Zm9.2 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
        />
      </svg>
    );
  }
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h2.2l1.5 8.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.5L21 7H7"
        stroke={IDLE}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19" r="1.4" stroke={IDLE} strokeWidth="1.85" />
      <circle cx="17.5" cy="19" r="1.4" stroke={IDLE} strokeWidth="1.85" />
    </svg>
  );
}

function ProfileIcon({ active }: TabIconProps) {
  if (active) {
    return (
      <svg width={ICON} height={ICON} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="8" r="4" fill={ACTIVE} />
        <path
          fill={ACTIVE}
          d="M4.4 19.6C5.7 16.9 8.5 15 12 15s6.3 1.9 7.6 4.6c.2.4-.1.9-.5.9H4.9c-.4 0-.7-.5-.5-.9Z"
        />
      </svg>
    );
  }
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.4" stroke={IDLE} strokeWidth="1.85" />
      <path
        d="M5.2 19.2c1.2-2.6 3.8-4.2 6.8-4.2s5.6 1.6 6.8 4.2"
        stroke={IDLE}
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

const tabs = [
  {
    href: '/',
    label: uz.navHome,
    Icon: HomeIcon,
    match: (path: string) =>
      path === '/' || path.startsWith('/restaurants/'),
  },
  {
    href: '/cart',
    label: uz.navCart,
    Icon: CartIcon,
    match: (path: string) => path === '/cart' || path.startsWith('/checkout'),
  },
  {
    href: '/profile',
    label: uz.navProfile,
    Icon: ProfileIcon,
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Asosiy navigatsiya"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2 pb-2">
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          const showBadge = href === '/cart' && cartCount > 0;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                onClick={handleNavClick(href)}
                className="mx-auto flex max-w-[5.5rem] flex-col items-center gap-1 px-2 py-1 transition active:scale-95"
              >
                <span className="relative flex h-12 w-12 items-center justify-center">
                  <Icon active={active} />
                  {showBadge && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span
                  className={clsx(
                    'text-[11px] leading-none tracking-tight',
                    active ? 'font-semibold text-primary' : 'font-medium text-zinc-400',
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
