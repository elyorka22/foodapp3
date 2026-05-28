'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { useStaffOrders } from '@/hooks/use-staff-orders';
import { OrderTable } from '@/components/orders/order-table';
import { Button } from '@/components/ui/button';

export default function ManagerPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const { data: orders, updateStatus } = useStaffOrders();
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null);
  const [courierId, setCourierId] = useState('');

  const { data: couriers } = useQuery({
    queryKey: ['couriers'],
    queryFn: () =>
      api<{ id: string; user: { fullName: string }; isOnline: boolean }[]>('/couriers', {
        token: token ?? undefined,
      }),
    enabled: !!token,
  });

  useEffect(() => {
    if (!token || user?.role !== 'MANAGER') router.replace('/login');
  }, [token, user, router]);

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

  return (
    <DashboardShell title="Manager Panel" nav={[{ href: '/manager', label: 'Operations' }]}>
      <h2 className="mb-3 font-semibold">Incoming orders</h2>
      <OrderTable
        orders={orders?.data ?? []}
        showRestaurant
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
      />

      <div className="mt-8 rounded-xl border p-4 dark:border-white/10">
        <h3 className="font-semibold">Assign courier</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="rounded-lg border px-3 py-2 dark:border-white/20 dark:bg-zinc-900"
            value={assignOrderId ?? ''}
            onChange={(e) => setAssignOrderId(e.target.value || null)}
          >
            <option value="">Select order</option>
            {orders?.data?.map((o) => (
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
            {couriers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.user.fullName} {c.isOnline ? '(online)' : ''}
              </option>
            ))}
          </select>
          <Button onClick={assignCourier}>Assign</Button>
        </div>
      </div>
    </DashboardShell>
  );
}
