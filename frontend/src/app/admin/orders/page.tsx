'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';
import { EmptyState, LoadingState, StatusBadge } from '@/components/admin/ui';
import { SearchInput, DateRangeFilter } from '@/components/admin/filters';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { useAdminSocket } from '@/hooks/use-admin-socket';
import { OrderDrawer } from '@/components/admin/order-drawer';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AdminOrdersPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [courierId, setCourierId] = useState('');

  useAdminSocket();

  const { list, getOne, getHistory, updateStatus: mutateStatus } = useAdminOrders({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
    dateFrom: from || undefined,
    dateTo: to || undefined,
  });

  const { data: couriers } = useMemo(() => ({ data: null as any }), []);

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  useEffect(() => {
    // Avoid Next.js useSearchParams prerender bailout
    if (typeof window === 'undefined') return;
    const open = new URLSearchParams(window.location.search).get('open');
    if (open) setOpenId(open);
  }, []);

  const totalPages = list.data?.meta?.totalPages ?? 1;
  const rows = list.data?.data ?? [];

  const [courierList, setCourierList] = useState<any[]>([]);
  useEffect(() => {
    if (!token) return;
    api<any[]>('/couriers', { token: token ?? undefined })
      .then(setCourierList)
      .catch(() => undefined);
  }, [token]);

  const changeStatus = async (id: string, next: string) => {
    await mutateStatus.mutateAsync({ id, status: next });
  };

  const assignCourier = async () => {
    if (!openId || !courierId) return;
    await mutateStatus.mutateAsync({ id: openId, status: 'COURIER_ASSIGNED', courierId });
  };

  const cancelOrder = async () => {
    if (!cancelId) return;
    await mutateStatus.mutateAsync({ id: cancelId, status: 'CANCELLED', cancelReason: 'Cancelled by admin' });
    setCancelId(null);
  };

  if (list.isLoading) return <LoadingState label="Loading orders..." />;

  if (list.isError) {
    return (
      <EmptyState
        title="Failed to load orders"
        description={list.error instanceof Error ? list.error.message : 'Unknown error'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search: order, phone, restaurant" />
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            {['PENDING','ACCEPTED','PREPARING','COURIER_ASSIGNED','PICKED_UP','DELIVERING','DELIVERED','CANCELLED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <DateRangeFilter
            from={from}
            to={to}
            onChange={(v) => { setFrom(v.from); setTo(v.to); setPage(1); }}
          />
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => { setSearch(''); setStatus(''); setFrom(''); setTo(''); setPage(1); }}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No orders" description="Try adjusting filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Restaurant</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
                <th className="p-3">Created</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o: any) => (
                <tr key={o.id} className="border-t dark:border-white/10">
                  <td className="p-3 font-mono text-xs">
                    <button type="button" className="text-brand-600" onClick={() => setOpenId(o.id)}>
                      {o.orderNumber}
                    </button>
                  </td>
                  <td className="p-3">{o.restaurant?.name}</td>
                  <td className="p-3">{o.guestOrder?.phone}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3">{Number(o.total).toLocaleString()} UZS</td>
                  <td className="p-3 text-xs opacity-70">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => setOpenId(o.id)}>
                        Details
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => setCancelId(o.id)}>
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs opacity-60">
          Page {list.data?.meta?.page ?? page} of {totalPages} · Total {list.data?.meta?.total ?? 0}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </Button>
          <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <OrderDrawer
        open={!!openId}
        orderId={openId}
        onClose={() => setOpenId(null)}
        load={getOne}
        loadHistory={getHistory}
        onChangeStatus={async (id, s) => changeStatus(id, s)}
      />

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel order?"
        description="This will set status to CANCELLED."
        danger
        confirmText="Cancel order"
        onCancel={() => setCancelId(null)}
        onConfirm={cancelOrder}
      />

      {openId && (
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm font-semibold">Assign courier</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
              value={courierId}
              onChange={(e) => setCourierId(e.target.value)}
            >
              <option value="">Select courier</option>
              {courierList.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.user?.fullName} {c.isOnline ? '(online)' : ''}
                </option>
              ))}
            </select>
            <Button type="button" onClick={assignCourier} disabled={!courierId}>
              Assign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
