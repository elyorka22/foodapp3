'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getToken } from '@/lib/auth';
import { api } from '@/lib/api';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { adminI18n as t } from '@/lib/admin-i18n';
import { LoadingState, StatCard, EmptyState } from '@/components/admin/ui';

type GlobalStats = {
  totalOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  platformCommission: number;
  activeRestaurants: number;
  onlineCouriers: number;
};

type TopProduct = {
  productId: string | null;
  name: string;
  quantity: number;
  revenue: number;
};

type TopRestaurant = {
  businessId: string;
  name: string;
  orderCount: number;
  revenue: number;
};

export default function AdminAnalyticsPage() {
  const token = getToken();
  const { ready, authorized } = useAdminAccess({ permission: 'reports' });

  const global = useQuery({
    queryKey: ['admin-reports-global'],
    queryFn: () => api<GlobalStats>('/analytics/global', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const topProducts = useQuery({
    queryKey: ['admin-reports-top-products'],
    queryFn: () => api<TopProduct[]>('/analytics/top-products', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  const topRestaurants = useQuery({
    queryKey: ['admin-reports-top-restaurants'],
    queryFn: () => api<TopRestaurant[]>('/analytics/top-restaurants', { token: token ?? undefined }),
    enabled: !!token && authorized,
  });

  if (!ready) return <LoadingState label={t.loading} />;
  if (!authorized) return null;

  const loading = global.isLoading || topProducts.isLoading || topRestaurants.isLoading;
  if (loading) return <LoadingState label={t.loading} />;

  if (global.isError) {
    return (
      <EmptyState
        title={t.noData}
        description={global.error instanceof Error ? global.error.message : ''}
      />
    );
  }

  const g = global.data;
  const products = topProducts.data ?? [];
  const restaurants = topRestaurants.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t.reports.title}</h1>
        <Link href="/admin" className="text-sm text-brand-600 hover:underline">
          {t.nav.dashboard}
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-60">
          {t.reports.revenue} / {t.reports.orders}
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <StatCard label={t.reports.totalOrders} value={g?.totalOrders ?? 0} />
          <StatCard label={t.reports.deliveredOrders} value={g?.deliveredOrders ?? 0} />
          <StatCard
            label={t.reports.totalRevenue}
            value={`${(g?.totalRevenue ?? 0).toLocaleString()} UZS`}
          />
          <StatCard
            label={t.reports.platformCommission}
            value={`${(g?.platformCommission ?? 0).toLocaleString()} UZS`}
          />
          <StatCard label={t.reports.activeMerchants} value={g?.activeRestaurants ?? 0} />
          <StatCard label={t.reports.onlineCouriers} value={g?.onlineCouriers ?? 0} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold">{t.reports.topSellingProducts}</h2>
          {products.length === 0 ? (
            <p className="text-sm opacity-60">{t.noData}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs opacity-60">
                <tr>
                  <th className="pb-2">{t.merchant.name}</th>
                  <th className="pb-2">{t.reports.quantity}</th>
                  <th className="pb-2">{t.reports.revenueCol}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productId ?? p.name} className="border-t dark:border-white/10">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.quantity}</td>
                    <td className="py-2">{p.revenue.toLocaleString()} UZS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold">{t.reports.topRestaurants}</h2>
          {restaurants.length === 0 ? (
            <p className="text-sm opacity-60">{t.noData}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs opacity-60">
                <tr>
                  <th className="pb-2">{t.merchant.name}</th>
                  <th className="pb-2">{t.reports.ordersCol}</th>
                  <th className="pb-2">{t.reports.revenueCol}</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.businessId} className="border-t dark:border-white/10">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.orderCount}</td>
                    <td className="py-2">{r.revenue.toLocaleString()} UZS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <p className="text-xs opacity-50">
        {t.reports.restaurants}, {t.reports.stores}, {t.reports.couriers} — batafsil hisobotlar keyingi bosqichda
        kengaytiriladi.
      </p>
    </div>
  );
}
