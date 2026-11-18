'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useCartStore } from '@/store/cart';
import { uz } from '@/lib/uz';

type TabIconProps = {
  active: boolean;
};

/** Brand mark (cloche + speed lines) for home — matches FoodApp app icon. */
const ACTIVE = '#18181B';
const IDLE = '#A1A1AA';
const ICON = 26;

function HomeIcon({ active }: TabIconProps) {
  const color = active ? ACTIVE : IDLE;
  if (active) {
    return (
      <svg width={ICON} height={ICON} viewBox="0 0 24 24" aria-hidden>
        {/* speed lines */}
        <rect x="1.5" y="8.2" width="4.2" height="1.55" rx="0.75" fill={color} />
        <rect x="1.5" y="11.2" width="5.4" height="1.55" rx="0.75" fill={color} />
        <rect x="1.5" y="14.2" width="3.4" height="1.55" rx="0.75" fill={color} />
        {/* handle */}
        <rect x="13.1" y="3.2" width="4.2" height="1.7" rx="0.85" fill={color} />
        {/* dome */}
        <path
          fill={color}
          d="M9.2 9.4c0-3.1 2.5-5.6 5.6-5.6s5.6 2.5 5.6 5.6v7.1H9.2V9.4Z"
        />
        {/* plate */}
        <rect x="8.2" y="16.6" width="11.6" height="2.2" rx="1.1" fill={color} />
        {/* highlight */}
        <path
          d="M11.2 10.2c.6-1.6 1.9-2.6 3.4-2.9"
          stroke="#F5F5F7"
          strokeWidth="1.35"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1.8 9h3.6M1.8 12h4.8M1.8 15h2.8"
        stroke={color}
        strokeWidth="1.85"
        strokeLinecap="round"
      />
      <rect
        x="13.2"
        y="3.4"
        width="3.8"
        height="1.5"
        rx="0.75"
        stroke={color}
        strokeWidth="1.7"
      />
      <path
        d="M9.4 9.2a5.4 5.4 0 0 1 10.8 0V16H9.4V9.2Z"
        stroke={color}
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <rect
        x="8.4"
        y="16.4"
        width="11.2"
        height="2"
        rx="1"
        stroke={color}
        strokeWidth="1.7"
      />
      <path
        d="M11.4 10c.55-1.4 1.7-2.3 3-2.55"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
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
      path === '/' ||
      path === '/restaurants' ||
      path.startsWith('/restaurants/') ||
      path === '/stores' ||
      path.startsWith('/stores') ||
      path.startsWith('/shops/'),
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
