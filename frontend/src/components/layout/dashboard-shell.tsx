'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, ClipboardList, LayoutDashboard } from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { PwaInstallButton } from '@/components/pwa/pwa-install-button';
import { adminI18n } from '@/lib/admin-i18n';
import { PWA_PROFILES } from '@/lib/pwa-profiles';
import { clsx } from 'clsx';

type NavItem = { href: string; label: string };

const NAV_ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  orders: ClipboardList,
  schedule: CalendarDays,
};

function navIconKey(href: string) {
  if (href.includes('/dashboard')) return 'dashboard';
  if (href.includes('/schedule')) return 'schedule';
  return 'orders';
}

function isNavActive(pathname: string, href: string) {
  if (href.endsWith('/dashboard')) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  const ordersRoot = href.replace(/\/dashboard$/, '').replace(/\/schedule$/, '');
  if (href === ordersRoot || href === ordersRoot.replace(/\/$/, '')) {
    return pathname === href || pathname === `${href}/` || pathname === ordersRoot;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const logout = () => {
    clearAuth();
    router.push(PWA_PROFILES.business.loginUrl);
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 dark:bg-zinc-950 md:pb-0">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-brand-600 md:text-lg">{title}</h1>
            <p className="truncate text-xs text-zinc-500">{user?.fullName ?? user?.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <PwaInstallButton profile="business" variant="panel" />
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 md:text-sm"
            >
              {adminI18n.logout}
            </button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 pb-2 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'whitespace-nowrap rounded-lg px-3 py-2 text-sm',
                isNavActive(pathname, item.href)
                  ? 'bg-brand-600 text-white'
                  : 'opacity-70 hover:bg-black/5 dark:hover:bg-white/10',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 md:py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95 md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
          {nav.map((item) => {
            const Icon = NAV_ICONS[navIconKey(item.href)] ?? ClipboardList;
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium',
                  active ? 'text-brand-600' : 'text-zinc-500',
                )}
              >
                <Icon className={clsx('h-5 w-5', active && 'stroke-[2.5px]')} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
