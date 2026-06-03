'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminCustomer, useAdminCustomers } from '@/hooks/use-admin-customers';
import { ActiveBadge } from '@/components/admin/active-badge';
import { StatusBadge, StatCard, EmptyState, LoadingState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';

function AdminCustomerDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { detail } = useAdminCustomer(id);
  const { updateStatus } = useAdminCustomers({ page: 1, limit: 1 });

  if (detail.isLoading) return <LoadingState label={t.loading} />;

  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        title="Customer not found"
        description={detail.error instanceof Error ? detail.error.message : undefined}
        action={<Link href="/admin/customers" className="text-sm underline">Back to list</Link>}
      />
    );
  }

  const { customer, stats, addresses, orders } = detail.data;

  const toggleBlock = async () => {
    try {
      await updateStatus.mutateAsync({ id: customer.id, isActive: !customer.isActive });
      toast.success(customer.isActive ? 'Customer blocked' : 'Customer unblocked');
      detail.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/customers" className="text-xs opacity-60 hover:underline">← Customers</Link>
          <h1 className="mt-1 text-lg font-semibold">{customer.fullName}</h1>
          <p className="text-sm opacity-60">
            {customer.phone ?? 'no phone'} · {customer.email ?? 'no email'}
            {customer.authProvider ? ` · ${customer.authProvider}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ActiveBadge active={customer.isActive} label={customer.isActive ? 'Active' : 'Blocked'} />
          <Button type="button" variant={customer.isActive ? 'danger' : 'primary'} onClick={toggleBlock}>
            {customer.isActive ? 'Block' : 'Unblock'}
          </Button>
        </div>
      </div>

      {(customer.telegramId || customer.isTelegramVerified) && (
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm font-semibold">Telegram</p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs opacity-60">Telegram ID</dt>
              <dd className="font-mono">{customer.telegramId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs opacity-60">Username</dt>
              <dd>{customer.telegramUsername ? `@${customer.telegramUsername}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs opacity-60">First name</dt>
              <dd>{customer.telegramFirstName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs opacity-60">Last login</dt>
              <dd>
                {customer.lastTelegramLoginAt
                  ? new Date(customer.lastTelegramLoginAt).toLocaleString()
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total orders" value={stats?.totalOrders ?? 0} />
        <StatCard label="Completed" value={stats?.completedOrders ?? 0} />
        <StatCard label="Cancelled" value={stats?.cancelledOrders ?? 0} />
        <StatCard label="Total spent" value={`${Number(stats?.totalSpent ?? 0).toLocaleString()} UZS`} />
        <StatCard
          label="Last order"
          value={stats?.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : '—'}
        />
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <p className="text-sm font-semibold">Saved addresses</p>
        {!addresses?.length ? (
          <p className="mt-2 text-sm opacity-60">No addresses yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {addresses.map((a: any, i: number) => (
              <li key={i} className="rounded-lg border px-3 py-2 dark:border-white/10">
                {a.line1}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
        <p className="border-b px-4 py-3 text-sm font-semibold dark:border-white/10">Order history</p>
        {!orders?.length ? (
          <p className="px-4 py-6 text-sm opacity-60">No orders yet.</p>
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
              {orders.map((o: any) => (
                <tr key={o.id} className="border-t dark:border-white/10">
                  <td className="px-4 py-2">{o.orderNumber}</td>
                  <td className="px-4 py-2">{o.restaurantName}</td>
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

export default function AdminCustomerDetailPage() {
  return (
    <AdminPageGuard permission="customers">
      <AdminCustomerDetailContent />
    </AdminPageGuard>
  );
}
