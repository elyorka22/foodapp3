'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { api } from '@/lib/api';
import { unwrapList } from '@/lib/list-utils';
import { useStaffOrders } from '@/hooks/use-staff-orders';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';
import { OrderTable } from '@/components/orders/order-table';
import { Button } from '@/components/ui/button';

type CourierOption = {
  id: string;
  user: { fullName: string };
  isOnline: boolean;
};

export default function ManagerPage() {
  const { ready, authorized, token } = useRequireStaffRole({ roles: 'MANAGER' });
  const {
    orders: orderList,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    updateStatus,
  } = useStaffOrders();
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null);
  const [courierId, setCourierId] = useState('');

  const {
    data: couriersRaw,
    isLoading: couriersLoading,
    isError: couriersError,
    error: couriersErr,
  } = useQuery({
    queryKey: ['couriers'],
    queryFn: () => api<CourierOption[] | { data: CourierOption[] }>('/couriers', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const courierList = unwrapList(couriersRaw);

  const assignCourier = async () => {
    if (!assignOrderId || !courierId || !token) return;
    await api(`/orders/${assignOrderId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status: 'COURIER_ASSIGNED', courierId }),
    });
    setAssignOrderId(null);
    setCourierId('');
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-sm text-zinc-500">
        Loading...
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <DashboardShell title="Manager Panel" nav={[{ href: '/manager', label: 'Operations' }]}>
      <h2 className="mb-3 font-semibold">Incoming orders</h2>

      {ordersLoading && <p className="text-sm text-zinc-500">Loading orders...</p>}
      {ordersError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {ordersErr instanceof Error ? ordersErr.message : 'Failed to load orders'}
        </p>
      )}
      {!ordersLoading && !ordersError && (
        <OrderTable
          orders={orderList}
          showRestaurant
          onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
        />
      )}

      <div className="mt-8 rounded-xl border p-4 dark:border-white/10">
        <h3 className="font-semibold">Assign courier</h3>

        {couriersLoading && <p className="mt-2 text-sm text-zinc-500">Loading couriers...</p>}
        {couriersError && (
          <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {couriersErr instanceof Error ? couriersErr.message : 'Failed to load couriers'}
          </p>
        )}

        {!couriersLoading && !couriersError && (
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
              value={assignOrderId ?? ''}
              onChange={(e) => setAssignOrderId(e.target.value || null)}
            >
              <option value="">Select order</option>
              {orderList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.status}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
              value={courierId}
              onChange={(e) => setCourierId(e.target.value)}
            >
              <option value="">Select courier</option>
              {courierList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.user?.fullName ?? 'Courier'} {c.isOnline ? '(online)' : ''}
                </option>
              ))}
            </select>
            <Button onClick={assignCourier} disabled={!assignOrderId || !courierId}>
              Assign
            </Button>
          </div>
        )}

        {!couriersLoading && !couriersError && courierList.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">No couriers available.</p>
        )}
      </div>
    </DashboardShell>
  );
}
