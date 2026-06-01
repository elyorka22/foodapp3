'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { api } from '@/lib/api';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';
import { LoadingState } from '@/components/admin/ui';

type RestaurantDashboard = {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  revenueChart: Array<{ date: string; value: number }>;
  ordersChart: Array<{ date: string; value: number }>;
};

export default function RestaurantDashboardPage() {
  const { ready, authorized, token } = useRequireStaffRole({
    roles: 'BUSINESS',
  });

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () => api<{ data: { id: string; name: string }[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const restaurantId = restaurants?.data?.[0]?.id;
  const restaurantName = restaurants?.data?.[0]?.name ?? 'Restaurant';

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-dashboard', restaurantId],
    queryFn: () =>
      api<RestaurantDashboard>(`/analytics/restaurant/${restaurantId}`, { token: token ?? undefined }),
    enabled: !!token && authorized && !!restaurantId,
  });

  const nav = [
    { href: '/restaurant/dashboard', label: 'Dashboard' },
    { href: '/restaurant', label: 'Orders' },
    { href: '/restaurant/schedule', label: 'Hours & holidays' },
  ];

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-sm text-zinc-500">
        Loading...
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <DashboardShell title={restaurantName} nav={nav}>
      {isLoading || !data ? (
        <LoadingState label="Loading dashboard..." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Stat label="Revenue today" value={`${data.revenueToday.toLocaleString()} UZS`} />
            <Stat label="Revenue week" value={`${data.revenueWeek.toLocaleString()} UZS`} />
            <Stat label="Revenue month" value={`${data.revenueMonth.toLocaleString()} UZS`} />
            <Stat label="Orders today" value={data.ordersToday} />
            <Stat label="Orders week" value={data.ordersWeek} />
            <Stat label="Avg order" value={`${Math.round(data.averageOrderValue).toLocaleString()} UZS`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue trend (30 days)">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#ea580c" fill="#fed7aa" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Orders trend (30 days)">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.ordersChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#bae6fd" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="rounded-xl border p-4 dark:border-white/10">
            <h2 className="mb-3 font-semibold">Top products</h2>
            {!data.topProducts.length ? (
              <p className="text-sm opacity-60">No sales yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.topProducts.map((p) => (
                  <li key={p.name} className="flex justify-between">
                    <span>
                      {p.name} <span className="opacity-60">×{p.quantity}</span>
                    </span>
                    <span>{p.revenue.toLocaleString()} UZS</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link href="/restaurant" className="text-sm font-semibold text-brand-600">
            Manage orders →
          </Link>
        </div>
      )}
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-3 dark:border-white/10">
      <p className="text-xs opacity-60">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4 dark:border-white/10">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}
