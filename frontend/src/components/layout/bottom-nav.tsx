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

/** Shared Lucide stroke — cart + profile must match weight/style. */
const STROKE = 2;

function CartIcon({ active }: TabIconProps) {
  const color = active ? BRAND : IDLE;
  // Filled takeaway basket — matches the reference nav mark.
  return (
    <svg
      width={ICON}
      height={ICON}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden
    >
      <path d="M6.15 9.85c.15-1.85 1.7-3.15 3.45-2.9 1.05.15 1.85.95 2.15 1.9.1.25-.1.45-.35.45H6.55c-.3 0-.5-.2-.4-.45z" />
      <path d="M14.35 7.55c.25-.7 1.2-.95 1.8-.35l1.15 1.25c.25.28.05.7-.32.7h-2.25c-.38 0-.58-.42-.38-.7z" />
      <path
        fillRule="evenodd"
        d="M4.15 10.15h15.7c.55 0 .95.5.85 1.05l-1.45 8.15A1.7 1.7 0 0 1 17.58 21H6.42a1.7 1.7 0 0 1-1.67-1.65L3.3 11.2c-.1-.55.3-1.05.85-1.05zm4.55.15v2.35c0 1.85 1.35 3.15 3.3 3.15s3.3-1.3 3.3-3.15V10.3h-1.35v2.15c0 1.05-.8 1.8-1.95 1.8s-1.95-.75-1.95-1.8V10.3H8.7z"
      />
    </svg>
  );
}

function ProfileIcon({ active }: TabIconProps) {
  const color = active ? BRAND : IDLE;
  // Lucide `user` — same stroke as CartIcon.
  return (
    <svg
      width={ICON}
      height={ICON}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5 pb-1">
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
                className="mx-auto flex max-w-[5.5rem] flex-col items-center gap-0.5 px-2 py-0.5 transition active:scale-95"
              >
                <span className="relative flex h-9 w-9 items-center justify-center">
                  <Icon active={active} />
                  {showBadge && (
                    <span
                      className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
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
