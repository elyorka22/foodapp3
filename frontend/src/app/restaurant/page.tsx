'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { api } from '@/lib/api';
import { useStaffOrders } from '@/hooks/use-staff-orders';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';
import { OrderTable } from '@/components/orders/order-table';

export default function RestaurantPanelPage() {
  const { ready, authorized, token } = useRequireStaffRole({
    roles: ['RESTAURANT_OWNER', 'RESTAURANT_STAFF'],
  });
  const { data: orders, updateStatus } = useStaffOrders();

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () => api<{ data: { id: string; name: string }[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const restaurantId = restaurants?.data?.[0]?.id;

  const { data: stats } = useQuery({
    queryKey: ['restaurant-stats', restaurantId],
    queryFn: () =>
      api<{ totalOrders: number; revenue: number }>(`/analytics/restaurant/${restaurantId}`, {
        token: token ?? undefined,
      }),
    enabled: !!token && authorized && !!restaurantId,
  });

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-sm text-zinc-500">
        Loading...
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <DashboardShell
      title={restaurants?.data?.[0]?.name ?? 'Restaurant'}
      nav={[
        { href: '/restaurant/dashboard', label: 'Dashboard' },
        { href: '/restaurant', label: 'Orders' },
        { href: '/restaurant/schedule', label: 'Hours & holidays' },
      ]}
    >
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4 dark:border-white/10">
          <p className="text-xs opacity-60">Orders</p>
          <p className="text-xl font-bold">{stats?.totalOrders ?? '—'}</p>
        </div>
        <div className="rounded-xl border p-4 dark:border-white/10">
          <p className="text-xs opacity-60">Revenue</p>
          <p className="text-xl font-bold">{stats?.revenue?.toLocaleString() ?? '—'} UZS</p>
        </div>
      </div>
      <OrderTable
        orders={orders?.data ?? []}
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
      />
    </DashboardShell>
  );
}
