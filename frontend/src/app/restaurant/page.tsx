'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { useStaffOrders } from '@/hooks/use-staff-orders';
import { OrderTable } from '@/components/orders/order-table';

export default function RestaurantPanelPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const { data: orders, updateStatus } = useStaffOrders();

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () => api<{ data: { id: string; name: string }[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token,
  });

  const restaurantId = restaurants?.data?.[0]?.id;

  const { data: stats } = useQuery({
    queryKey: ['restaurant-stats', restaurantId],
    queryFn: () =>
      api<{ totalOrders: number; revenue: number }>(`/analytics/restaurant/${restaurantId}`, {
        token: token ?? undefined,
      }),
    enabled: !!token && !!restaurantId,
  });

  useEffect(() => {
    const ok = user?.role === 'RESTAURANT_OWNER' || user?.role === 'RESTAURANT_STAFF';
    if (!token || !ok) router.replace('/login');
  }, [token, user, router]);

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
