'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { LoadingState, StatCard, EmptyState, StatusBadge } from '@/components/admin/ui';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () =>
      api<{
        todayOrders: number;
        pendingOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        revenueToday: number;
        revenueMonth: number;
        activeCouriers: number;
        activeRestaurants: number;
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
      }>('/analytics/dashboard', { token: token ?? undefined }),
    enabled: !!token,
  });

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  if (isLoading) return <LoadingState label="Loading dashboard..." />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description={error instanceof Error ? error.message : 'Unknown error'}
        action={
          <button
            type="button"
            className="text-sm font-semibold text-brand-600"
            onClick={() => refetch()}
          >
            Retry
          </button>
        }
      />
    );
  }

  if (!data) return <EmptyState title="No data" description="Dashboard data not available." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <StatCard label="Today Orders" value={data.todayOrders} />
        <StatCard label="Pending" value={data.pendingOrders} />
        <StatCard label="Delivered" value={data.deliveredOrders} />
        <StatCard label="Cancelled" value={data.cancelledOrders} />
        <StatCard label="Revenue Today" value={`${data.revenueToday.toLocaleString()} UZS`} />
        <StatCard label="Revenue Month" value={`${data.revenueMonth.toLocaleString()} UZS`} />
        <StatCard label="Active Couriers" value={data.activeCouriers} subLabel={`Restaurants: ${data.activeRestaurants}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue (last 30 days)">
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
        <ChartCard title="Orders (last 30 days)">
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

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand-600">
            View all →
          </Link>
        </div>
        {!data.recentOrders.length ? (
          <p className="text-sm opacity-60">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs opacity-60">
                <tr>
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Restaurant</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t dark:border-white/10">
                    <td className="py-2 pr-3 font-mono text-xs">
                      <Link href={`/admin/orders?open=${o.id}`} className="text-brand-600">
                        {o.orderNumber}
                      </Link>
                    </td>
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
