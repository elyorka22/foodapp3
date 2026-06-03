'use client';

import { useQuery } from '@tanstack/react-query';
import { getToken } from '@/lib/auth';
import { api } from '@/lib/api';
import { LoadingState, StatCard, EmptyState, StatusBadge } from '@/components/admin/ui';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Link from 'next/link';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { adminI18n as t } from '@/lib/admin-i18n';

type DashboardData = {
  todayOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueToday: number;
  revenueMonth: number;
  activeCouriers: number;
  activeRestaurants: number;
  activeStores: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    restaurant?: { name: string };
    guestOrder?: { phone: string; deliveryAddress: string };
    courier?: { fullName: string } | null;
  }>;
  revenueChart: Array<{ date: string; value: number }>;
  ordersChart: Array<{ date: string; value: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  topRestaurants: Array<{ name: string; orderCount: number; revenue: number }>;
};

export default function AdminPage() {
  const token = getToken();
  const { ready, authorized } = useAdminAccess({ permission: 'dashboard' });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api<DashboardData>('/analytics/dashboard', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  if (!ready) return <LoadingState label={t.loading} />;
  if (!authorized) return null;
  if (isLoading) return <LoadingState label={t.loading} />;

  if (isError) {
    return (
      <EmptyState
        title={t.noData}
        description={error instanceof Error ? error.message : ''}
        action={
          <button type="button" className="text-sm font-semibold text-brand-600" onClick={() => refetch()}>
            {t.search}
          </button>
        }
      />
    );
  }

  if (!data) return <EmptyState title={t.noData} description="" />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{t.nav.dashboard}</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label={t.dashboard.todayOrders} value={data.todayOrders} />
        <StatCard label={t.dashboard.activeOrders} value={data.pendingOrders} />
        <StatCard label={t.dashboard.completedOrders} value={data.deliveredOrders} />
        <StatCard label={t.dashboard.cancelledOrders} value={data.cancelledOrders} />
        <StatCard label={t.dashboard.revenueToday} value={`${data.revenueToday.toLocaleString()} UZS`} />
        <StatCard label={t.dashboard.revenueMonth} value={`${data.revenueMonth.toLocaleString()} UZS`} />
        <StatCard label={t.dashboard.activeRestaurants} value={data.activeRestaurants} />
        <StatCard label={t.dashboard.activeStores} value={data.activeStores ?? 0} />
        <StatCard label={t.dashboard.activeCouriers} value={data.activeCouriers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t.dashboard.revenueChart}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#ea580c" fill="#fed7aa" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t.dashboard.ordersChart}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.ordersChart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#bae6fd" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="mb-3 font-semibold">{t.dashboard.topProducts}</h2>
          {!data.topProducts?.length ? (
            <p className="text-sm opacity-60">{t.noData}</p>
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
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="mb-3 font-semibold">{t.dashboard.topRestaurants}</h2>
          {!data.topRestaurants?.length ? (
            <p className="text-sm opacity-60">{t.noData}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.topRestaurants.map((r) => (
                <li key={r.name} className="flex justify-between">
                  <span>
                    {r.name} <span className="opacity-60">×{r.orderCount}</span>
                  </span>
                  <span>{r.revenue.toLocaleString()} UZS</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{t.dashboard.recentOrders}</h2>
          <Link href="/admin/orders/all" className="text-sm font-semibold text-brand-600">
            {t.nav.allOrders} →
          </Link>
        </div>
        {!data.recentOrders.length ? (
          <p className="text-sm opacity-60">{t.noData}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs opacity-60">
                <tr>
                  <th className="py-2 pr-3">{t.orders.orderNumber}</th>
                  <th className="py-2 pr-3">{t.orders.merchant}</th>
                  <th className="py-2 pr-3">{t.orders.customer}</th>
                  <th className="py-2 pr-3">{t.orders.status}</th>
                  <th className="py-2 pr-3">{t.orders.total}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t dark:border-white/10">
                    <td className="py-2 pr-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="py-2 pr-3">{o.restaurant?.name}</td>
                    <td className="py-2 pr-3">{o.guestOrder?.phone}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-2 pr-3">{Number(o.total).toLocaleString()} UZS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="mb-3 text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}
