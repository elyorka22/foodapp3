'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getToken, getUser } from '@/lib/auth';
import { useStaffOrders } from '@/hooks/use-staff-orders';
import { OrderTable } from '@/components/orders/order-table';

export default function AdminOrdersPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const { data: orders, updateStatus } = useStaffOrders();

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  return (
    <DashboardShell
      title="All Orders"
      nav={[
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/orders', label: 'Orders' },
      ]}
    >
      <OrderTable
        orders={orders?.data ?? []}
        showRestaurant
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
      />
    </DashboardShell>
  );
}
