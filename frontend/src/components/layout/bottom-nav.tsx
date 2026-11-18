'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useCartStore } from '@/store/cart';
import { uz } from '@/lib/uz';

type TabIconProps = {
  active: boolean;
};

/** Brand purple — matches wing logo; active nav tabs use this. */
const BRAND = '#4A05CA';
const IDLE = '#A1A1AA';
const HOME_ICON = 28;
/** Cart/profile stroke icons read smaller than the wing mark — bump for visual parity. */
const ICON = 31;

function HomeIcon({ active }: TabIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand-wing.png"
      alt=""
      width={HOME_ICON}
      height={HOME_ICON}
      draggable={false}
      className={clsx(
        'select-none object-contain transition',
        active ? 'opacity-100' : 'opacity-50 grayscale',
      )}
    />
  );
}

function CartIcon({ active }: TabIconProps) {
  const color = active ? BRAND : IDLE;
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h2.2l1.5 8.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.5L21 7H7"
        stroke={color}
        strokeWidth={active ? 2.15 : 1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="19" r="1.4" stroke={color} strokeWidth={active ? 2.15 : 1.85} />
      <circle cx="17.5" cy="19" r="1.4" stroke={color} strokeWidth={active ? 2.15 : 1.85} />
    </svg>
  );
}

function ProfileIcon({ active }: TabIconProps) {
  const color = active ? BRAND : IDLE;
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="8"
        r="3.4"
        stroke={color}
        strokeWidth={active ? 2.15 : 1.85}
      />
      <path
        d="M5.2 19.2c1.2-2.6 3.8-4.2 6.8-4.2s5.6 1.6 6.8 4.2"
        stroke={color}
        strokeWidth={active ? 2.15 : 1.85}
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
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span
                  className={clsx(
                    'text-[11px] leading-none tracking-tight',
                    active ? 'font-semibold' : 'font-medium text-zinc-400',
                  )}
                  style={active ? { color: BRAND } : undefined}
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
