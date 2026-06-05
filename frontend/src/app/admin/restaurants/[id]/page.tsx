'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { adminI18n as t } from '@/lib/admin-i18n';
import { toast } from 'sonner';
import { useAdminRestaurant, useAdminRestaurants } from '@/hooks/use-admin-restaurants';
import { Button } from '@/components/ui/button';
import { CategoryPanel } from '@/components/admin/category-panel';
import { ActiveBadge } from '@/components/admin/active-badge';
import { StatusBadge, StatCard, EmptyState, LoadingState } from '@/components/admin/ui';

export default function AdminRestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, authorized } = useAdminAccess({ permission: 'restaurants' });
  const token = getToken();
  const { detail, stats } = useAdminRestaurant(id);
  const { updateApproval } = useAdminRestaurants({ page: 1, limit: 1 });

  const menuProducts = useQuery({
    queryKey: ['admin-menu-preview', id],
    queryFn: () => api<{ id: string; name: string; price: number; isAvailable?: boolean }[]>(`/products?restaurantId=${id}`),
    enabled: !!token && !!id,
  });

  if (!ready) return <LoadingState label={t.loading} />;
  if (!authorized) return null;

  if (detail.isLoading || stats.isLoading) {
    return <LoadingState label="Loading restaurant..." />;
  }

  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        title="Restaurant not found"
        description={detail.error instanceof Error ? detail.error.message : undefined}
        action={
          <Link href="/admin/restaurants" className="text-sm underline">
            Back to list
          </Link>
        }
      />
    );
  }

  const r = detail.data;
  const s = stats.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/restaurants" className="text-xs opacity-60 hover:underline">
            ← Restaurants
          </Link>
          <h1 className="mt-1 text-lg font-semibold">{r.name}</h1>
          <p className="text-sm opacity-60">{r.slug}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs dark:bg-white/10">
            {r.approvalStatus ?? 'APPROVED'}
          </span>
          <ActiveBadge active={r.isActive} />
          <Link href={`/admin/restaurants/${id}/finance`}>
            <Button type="button" variant="secondary">Finance</Button>
          </Link>
          {r.approvalStatus === 'PENDING' && (
            <>
              <Button
                type="button"
                onClick={async () => {
                  await updateApproval.mutateAsync({ id, status: 'APPROVED' });
                  toast.success('Restaurant approved');
                  detail.refetch();
                }}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={async () => {
                  await updateApproval.mutateAsync({ id, status: 'REJECTED', note: 'Rejected by admin' });
                  toast.success('Restaurant rejected');
                  detail.refetch();
                }}
              >
                Reject
              </Button>
            </>
          )}
          {r.approvalStatus === 'APPROVED' && (
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                await updateApproval.mutateAsync({ id, status: 'SUSPENDED', note: 'Suspended by admin' });
                toast.success('Restaurant suspended');
                detail.refetch();
              }}
            >
              Suspend
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total orders" value={s?.totalOrders ?? 0} />
        <StatCard label="Completed" value={s?.completedOrders ?? 0} />
        <StatCard label="Cancelled" value={s?.cancelledOrders ?? 0} />
        <StatCard label="Revenue" value={`${Number(s?.revenue ?? 0).toLocaleString()} UZS`} />
        <StatCard label="Avg order value" value={`${Number(s?.averageOrderValue ?? 0).toLocaleString()} UZS`} />
        <StatCard label="Products" value={s?.productsCount ?? 0} />
        <StatCard label="Commission rate" value={`${Number(r.commissionRate ?? 0)}%`} />
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <p className="text-sm font-semibold">Details</p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="opacity-60">Description</dt>
            <dd>{r.description || '—'}</dd>
          </div>
          <div>
            <dt className="opacity-60">Phone</dt>
            <dd>{r.phone || '—'}</dd>
          </div>
          <div>
            <dt className="opacity-60">Coordinates</dt>
            <dd>
              {r.latitude != null && r.longitude != null
                ? `${Number(r.latitude).toFixed(6)}, ${Number(r.longitude).toFixed(6)}`
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="opacity-60">Branch address</dt>
            <dd>{r.branchAddress || r.address || '—'}</dd>
          </div>
          <div>
            <dt className="opacity-60">Logo</dt>
            <dd>{r.logoUrl ? <img src={r.logoUrl} alt="" className="mt-1 h-12 w-12 rounded object-cover" /> : '—'}</dd>
          </div>
          <div>
            <dt className="opacity-60">Cover</dt>
            <dd>{r.coverUrl ? <img src={r.coverUrl} alt="" className="mt-1 h-16 w-32 rounded object-cover" /> : '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Menu categories</p>
        <Link href="/admin/dish-categories" className="text-sm font-medium text-brand-600 hover:underline">
          Taom kategoriyalarini boshqarish
        </Link>
      </div>
      <CategoryPanel />

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Menu on site ({menuProducts.data?.length ?? 0} items)</p>
          <div className="flex gap-2">
            <Link href={`/admin/products?restaurantId=${id}`}>
              <Button type="button" variant="secondary">Manage products</Button>
            </Link>
            {r.slug && (
              <Link href={`/restaurants/${r.slug}`} target="_blank" rel="noopener noreferrer">
                <Button type="button">View menu</Button>
              </Link>
            )}
          </div>
        </div>
        {menuProducts.isLoading ? (
          <p className="mt-3 text-sm opacity-60">Loading menu...</p>
        ) : !menuProducts.data?.length ? (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
            No visible dishes on the customer site. Add products in Products and ensure status is Available (not
            Hidden).
          </p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {menuProducts.data.slice(0, 12).map((p) => (
              <li key={p.id} className="flex justify-between gap-2 border-b border-zinc-100 py-1.5 dark:border-white/10">
                <span>{p.name}</span>
                <span className="opacity-60">{Number(p.price).toLocaleString()} UZS</span>
              </li>
            ))}
            {menuProducts.data.length > 12 && (
              <li className="pt-1 text-xs opacity-50">+{menuProducts.data.length - 12} more</li>
            )}
          </ul>
        )}
      </div>

      <div className="rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
        <p className="border-b px-4 py-3 text-sm font-semibold dark:border-white/10">Latest orders</p>
        {!s?.latestOrders?.length ? (
          <p className="px-4 py-6 text-sm opacity-60">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {s.latestOrders.map((o: any) => (
                <tr key={o.id} className="border-t dark:border-white/10">
                  <td className="px-4 py-2">{o.orderNumber}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={o.status} />
                  </td>
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
