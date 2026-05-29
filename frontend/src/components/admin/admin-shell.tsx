'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  TicketPercent,
  Truck,
  Users,
  Image as ImageIcon,
  ScrollText,
  Server,
} from 'lucide-react';
import { NotificationsBell } from '@/components/admin/notifications-bell';
import { clsx } from 'clsx';
import { clearAuth, getToken, getUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number }> };

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/restaurants', label: 'Restaurants', icon: Building2 },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/couriers', label: 'Couriers', icon: Truck },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
  { href: '/admin/system', label: 'System', icon: Server },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: TicketPercent },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = useMemo(() => getUser(), []);
  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') {
      router.replace('/login');
    }
  }, [router, token, user?.role]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border p-2 md:hidden dark:border-white/10"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <Link href="/admin" className="font-bold text-brand-600">
              FoodApp Admin
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold">{user?.fullName ?? user?.email}</p>
              <p className="text-xs opacity-60">{user?.role}</p>
            </div>
            <NotificationsBell />
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-red-600 dark:border-white/10"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 md:grid-cols-[260px_1fr]">
        <aside className="hidden h-[calc(100vh-57px)] border-r bg-white/60 p-3 md:sticky md:top-[57px] md:block md:overflow-y-auto dark:border-white/10 dark:bg-zinc-900/40">
          <Sidebar pathname={pathname} />
        </aside>

        <main className="p-4 md:p-6">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-white p-3 shadow-xl dark:bg-zinc-950">
            <Sidebar pathname={pathname} />
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
              active
                ? 'bg-brand-600 text-white'
                : 'opacity-75 hover:bg-black/5 dark:hover:bg-white/10',
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
      <div className="pt-3 text-xs opacity-50">
        <p className="font-medium">System</p>
        <p className="mt-1">SUPER_ADMIN only</p>
      </div>
    </nav>
  );
}

