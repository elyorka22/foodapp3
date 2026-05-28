'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { useStaffOrders } from '@/hooks/use-staff-orders';
import { OrderTable } from '@/components/orders/order-table';

export default function AdminPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const { data: orders, updateStatus } = useStaffOrders();

  const { data: stats } = useQuery({
    queryKey: ['analytics-global'],
    queryFn: () =>
      api<{
        totalOrders: number;
        deliveredOrders: number;
        totalRevenue: number;
        activeRestaurants: number;
        onlineCouriers: number;
      }>('/analytics/global', { token: token ?? undefined }),
    enabled: !!token,
  });

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  return (
    <DashboardShell
      title="Super Admin"
      nav={[
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/orders', label: 'Orders' },
        { href: '/login', label: 'Home' },
      ]}
    >
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Orders" value={stats?.totalOrders} />
        <StatCard label="Delivered" value={stats?.deliveredOrders} />
        <StatCard label="Revenue" value={stats?.totalRevenue?.toLocaleString()} suffix=" UZS" />
        <StatCard label="Couriers online" value={stats?.onlineCouriers} />
      </div>
      <h2 className="mb-3 font-semibold">Recent orders</h2>
      <OrderTable
        orders={orders?.data ?? []}
        showRestaurant
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
      />
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  suffix = '',
}: {
  label: string;
  value?: number | string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="text-xs opacity-60">{label}</p>
      <p className="mt-1 text-xl font-bold">
        {value ?? '—'}
        {suffix}
      </p>
    </div>
  );
}
