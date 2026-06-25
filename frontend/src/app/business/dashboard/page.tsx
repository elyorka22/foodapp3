'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { api } from '@/lib/api';
import { useRequireStaffRole } from '@/hooks/use-require-staff-role';
import { LoadingState } from '@/components/admin/ui';
import { businessPanelI18n } from '@/lib/business-panel-i18n';
import { businessPanelNav } from '@/lib/business-panel-nav';
import {
  BusinessDashboardView,
  type BusinessDashboardData,
} from '@/components/business/business-dashboard-view';

export default function BusinessDashboardPage() {
  const { ready, authorized, token } = useRequireStaffRole({
    roles: 'BUSINESS',
  });
  const t = businessPanelI18n;

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants-admin'],
    queryFn: () => api<{ data: { id: string; name: string }[] }>('/restaurants/admin', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const restaurantId = restaurants?.data?.[0]?.id;
  const restaurantName = restaurants?.data?.[0]?.name ?? t.defaultTitle;

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-dashboard', restaurantId],
    queryFn: () =>
      api<BusinessDashboardData>(`/analytics/restaurant/${restaurantId}`, { token: token ?? undefined }),
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
    <DashboardShell title={restaurantName} nav={businessPanelNav('/business')}>
      {isLoading || !data ? (
        <LoadingState label={t.loadingDashboard} />
      ) : (
        <BusinessDashboardView data={data} ordersHref="/business" />
      )}
    </DashboardShell>
  );
}
