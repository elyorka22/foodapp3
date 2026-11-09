'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalLink, LogOut, Menu } from 'lucide-react';
import { NotificationsBell } from '@/components/admin/notifications-bell';
import { PwaInstallButton } from '@/components/pwa/pwa-install-button';
import { clsx } from 'clsx';
import { clearAuth, getUser } from '@/lib/auth';
import { registerStaffDevice } from '@/lib/device-registration';
import { ThemeToggle } from '@/components/theme-toggle';
import { ADMIN_LEGACY_REDIRECTS, getAdminNavForRole, type AdminNavLink } from '@/lib/admin-nav';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { useAdminBusinessTypes } from '@/hooks/use-admin-business-types';
import { adminI18n as t } from '@/lib/admin-i18n';

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Prefer the longest matching href so parent list items don't stay active on child routes. */
function resolveActiveHref(pathname: string, items: AdminNavLink[]): string | null {
  let best: string | null = null;
  for (const item of items) {
    if (!isNavItemActive(pathname, item.href)) continue;
    if (!best || item.href.length > best.length) best = item.href;
  }
  return best;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = useMemo(() => getUser(), []);
  const { ready, authorized, isManager } = useAdminAccess();
  const businessTypesQuery = useAdminBusinessTypes();
  const navGroups = useMemo(
    () => getAdminNavForRole(user?.role, businessTypesQuery.list.data ?? []),
    [user?.role, businessTypesQuery.list.data],
  );

  useEffect(() => {
    if (ready && authorized) void registerStaffDevice();
  }, [ready, authorized]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const target = ADMIN_LEGACY_REDIRECTS[pathname];
    if (target) router.replace(target);
  }, [pathname, router]);

  const logout = () => {
    clearAuth();
    router.push('/staff/login?app=admin');
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        {t.loading}
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b bg-white/95 dark:border-white/10 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border p-2 md:hidden dark:border-white/10"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menyu"
            >
              <Menu size={18} />
            </button>
            <Link href="/admin" className="font-bold text-primary">
              {isManager ? t.managerAppName : t.appName}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-primary-soft px-3 py-2 text-sm font-medium text-primary sm:inline-flex"
            >
              <ExternalLink size={16} />
              {t.backToSite}
            </Link>
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold">{user?.fullName ?? user?.email}</p>
              <p className="text-xs text-zinc-500">{user?.role}</p>
            </div>
            <NotificationsBell />
            <PwaInstallButton profile="admin" variant="panel" />
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-red-600 dark:border-white/10"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[272px_1fr]">
        <aside className="hidden border-r bg-white md:sticky md:top-[57px] md:block md:h-[calc(100vh-57px)] md:overflow-y-auto dark:border-white/10 dark:bg-zinc-900/50">
          <AdminSidebar pathname={pathname} navGroups={navGroups} />
        </aside>

        <main className="min-w-0 p-4 md:p-6">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Yopish"
          />
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-xs overflow-y-auto bg-white p-3 shadow-xl dark:bg-zinc-950">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              <ExternalLink size={16} />
              {t.backToSite}
            </Link>
            <AdminSidebar pathname={pathname} navGroups={navGroups} />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSidebar({
  pathname,
  navGroups,
}: {
  pathname: string;
  navGroups: ReturnType<typeof getAdminNavForRole>;
}) {
  const allItems = navGroups.flatMap((g) => g.items);
  const activeHref = resolveActiveHref(pathname, allItems);

  return (
    <nav className="space-y-4 p-3" aria-label="Admin menyu">
      {navGroups.map((group, index) => {
        const groupActive = group.items.some((item) => item.href === activeHref);

        return (
          <div
            key={group.id}
            className={clsx(
              index > 0 && 'border-t border-zinc-100 pt-4 dark:border-white/10',
            )}
          >
            <p
              className={clsx(
                'mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider',
                groupActive ? 'text-primary' : 'text-zinc-400',
              )}
            >
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === activeHref;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                      active
                        ? 'bg-primary text-white'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10',
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="leading-snug">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
