'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { api } from '@/lib/api';
import { useStaffOrders } from '@/hooks/use-staff-orders';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';
import { businessPanelI18n } from '@/lib/business-panel-i18n';
import { businessPanelNav } from '@/lib/business-panel-nav';
import { BusinessOrdersView } from '@/components/business/business-orders-view';
import type { BusinessDashboardData } from '@/components/business/business-dashboard-view';

export default function RestaurantPanelPage() {
  const { ready, authorized, token } = useRequireStaffRole({
    roles: 'BUSINESS',
  });
  const { orders, updateStatus, requestCourier } = useStaffOrders();
  const t = businessPanelI18n;

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () => api<{ data: { id: string; name: string }[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const restaurantId = restaurants?.data?.[0]?.id;

  const { data: stats } = useQuery({
    queryKey: ['restaurant-dashboard', restaurantId],
    queryFn: () =>
      api<BusinessDashboardData>(`/analytics/restaurant/${restaurantId}`, {
        token: token ?? undefined,
      }),
    enabled: !!token && authorized && !!restaurantId,
  });

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8 text-sm text-zinc-500">
        {t.loading}
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <DashboardShell
      title={restaurants?.data?.[0]?.name ?? t.defaultTitle}
      nav={businessPanelNav('/restaurant')}
    >
      <BusinessOrdersView
        orders={orders}
        stats={stats}
        dashboardHref="/restaurant/dashboard"
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
        onRequestCourier={(id) => requestCourier.mutate(id)}
        requestCourierPendingId={
          requestCourier.isPending ? (requestCourier.variables as string) : null
        }
      />
    </DashboardShell>
  );
}
