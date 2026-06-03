'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminCourier } from '@/hooks/use-admin-couriers';
import { ActiveBadge } from '@/components/admin/active-badge';
import { StatusBadge, StatCard, EmptyState, LoadingState } from '@/components/admin/ui';

export default function AdminCourierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, authorized } = useAdminAccess({ permission: 'couriers' });
  const { detail, history } = useAdminCourier(id);

  if (!ready) return <LoadingState label={t.loading} />;
  if (!authorized) return null;

  if (detail.isLoading) return <LoadingState label={t.loading} />;

  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        title="Courier not found"
        description={detail.error instanceof Error ? detail.error.message : undefined}
        action={<Link href="/admin/couriers" className="text-sm underline">Back to list</Link>}
      />
    );
  }

  const c = detail.data;
  const s = c.stats;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/couriers" className="text-xs opacity-60 hover:underline">← Couriers</Link>
        <h1 className="mt-1 text-lg font-semibold">{c.user?.fullName}</h1>
        <p className="text-sm opacity-60">{c.user?.phone} · {c.user?.email ?? 'no email'}</p>
        <div className="mt-2 flex gap-2">
          <ActiveBadge active={c.user?.isActive ?? false} label={c.user?.isActive ? 'Account active' : 'Account inactive'} />
          <ActiveBadge active={c.isOnline} label={c.isOnline ? 'Online' : 'Offline'} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Completed deliveries" value={s?.completedOrders ?? 0} />
        <StatCard label="Cancelled" value={s?.cancelledOrders ?? 0} />
        <StatCard label="Active orders" value={s?.activeOrders ?? 0} />
        <StatCard label="Delivery revenue" value={`${Number(s?.totalRevenue ?? 0).toLocaleString()} UZS`} />
        <StatCard label="Avg delivery time" value={`${s?.averageDeliveryTime ?? 0} min`} />
        <StatCard label="Total earnings" value={`${Number(c.totalEarnings ?? 0).toLocaleString()} UZS`} />
      </div>

      {c.currentOrder && (
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm font-semibold">Current order</p>
          <p className="mt-2 text-sm">
            {c.currentOrder.orderNumber} · {c.currentOrder.restaurant?.name} ·{' '}
            <StatusBadge status={c.currentOrder.status} />
          </p>
          <p className="text-sm opacity-70">{Number(c.currentOrder.total).toLocaleString()} UZS</p>
        </div>
      )}

      <div className="rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
        <p className="border-b px-4 py-3 text-sm font-semibold dark:border-white/10">Recent deliveries</p>
        {history.isLoading ? (
          <p className="px-4 py-6 text-sm opacity-60">Loading history...</p>
        ) : !history.data?.length ? (
          <p className="px-4 py-6 text-sm opacity-60">No deliveries yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Restaurant</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.data.map((o: any) => (
                <tr key={o.id} className="border-t dark:border-white/10">
                  <td className="px-4 py-2">{o.orderNumber}</td>
                  <td className="px-4 py-2">{o.restaurant?.name}</td>
                  <td className="px-4 py-2"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-2">{Number(o.total).toLocaleString()} UZS</td>
                  <td className="px-4 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
