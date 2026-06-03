'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { useAdminAccess } from '@/hooks/use-admin-access';
import { EmptyState, LoadingState, StatusBadge } from '@/components/admin/ui';
import { SearchInput, DateRangeFilter } from '@/components/admin/filters';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { useAdminSocket } from '@/hooks/use-admin-socket';
import { OrderDrawer } from '@/components/admin/order-drawer';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { adminI18n as t } from '@/lib/admin-i18n';

type Props = {
  title: string;
  vertical?: 'restaurant' | 'store';
  statusGroup?: 'active' | 'cancelled';
  lockStatus?: boolean;
  merchantColumnLabel?: string;
};

export function AdminOrdersView({
  title,
  vertical,
  statusGroup,
  lockStatus = false,
  merchantColumnLabel,
}: Props) {
  const token = getToken();
  const { ready, authorized } = useAdminAccess({ permission: 'orders' });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [courierId, setCourierId] = useState('');
  const [courierList, setCourierList] = useState<any[]>([]);

  useAdminSocket();

  const { list, getOne, getHistory, updateStatus: mutateStatus } = useAdminOrders({
    page,
    limit: 20,
    search: search || undefined,
    status: lockStatus ? undefined : status || undefined,
    statusGroup,
    vertical,
    dateFrom: from || undefined,
    dateTo: to || undefined,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const open = new URLSearchParams(window.location.search).get('open');
    if (open) setOpenId(open);
  }, []);

  useEffect(() => {
    if (!token) return;
    api<any[]>('/couriers', { token: token ?? undefined })
      .then(setCourierList)
      .catch(() => undefined);
  }, [token]);

  const totalPages = list.data?.meta?.totalPages ?? 1;
  const rows = list.data?.data ?? [];
  const merchantLabel =
    merchantColumnLabel ??
    (vertical === 'store' ? t.orders.store : t.orders.restaurant);

  const changeStatus = async (id: string, next: string) => {
    await mutateStatus.mutateAsync({ id, status: next });
  };

  const assignCourier = async () => {
    if (!openId || !courierId) return;
    await mutateStatus.mutateAsync({ id: openId, status: 'COURIER_ASSIGNED', courierId });
  };

  const cancelOrder = async () => {
    if (!cancelId) return;
    await mutateStatus.mutateAsync({
      id: cancelId,
      status: 'CANCELLED',
      cancelReason: 'Admin bekor qildi',
    });
    setCancelId(null);
  };

  if (!ready) return <LoadingState label={t.loading} />;
  if (!authorized) return null;
  if (list.isLoading) return <LoadingState label={t.loading} />;

  if (list.isError) {
    return (
      <EmptyState
        title="Xatolik"
        description={list.error instanceof Error ? list.error.message : "Noma'lum xatolik"}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{title}</h1>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-4">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Buyurtma, telefon, savdo nuqtasi..."
          />
          {!lockStatus && (
            <select
              className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Barcha holatlar</option>
              {[
                'PENDING',
                'ACCEPTED',
                'PREPARING',
                'COURIER_ASSIGNED',
                'PICKED_UP',
                'DELIVERING',
                'DELIVERED',
                'CANCELLED',
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          <DateRangeFilter
            from={from}
            to={to}
            onChange={(v) => {
              setFrom(v.from);
              setTo(v.to);
              setPage(1);
            }}
          />
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearch('');
                setStatus('');
                setFrom('');
                setTo('');
                setPage(1);
              }}
            >
              Tozalash
            </Button>
          </div>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title={t.noData} description="Filtrlarni o'zgartiring." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-zinc-500">
              <tr>
                <th className="p-3">{t.orders.orderNumber}</th>
                <th className="p-3">{merchantLabel}</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">{t.orders.status}</th>
                <th className="p-3">{t.orders.total}</th>
                <th className="p-3">{t.orders.date}</th>
                <th className="p-3">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o: any) => (
                <tr key={o.id} className="border-t dark:border-white/10">
                  <td className="p-3 font-mono text-xs">
                    <button type="button" className="text-primary" onClick={() => setOpenId(o.id)}>
                      {o.orderNumber}
                    </button>
                  </td>
                  <td className="p-3">{o.restaurant?.name}</td>
                  <td className="p-3">{o.guestOrder?.phone}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3">{Number(o.total).toLocaleString()} UZS</td>
                  <td className="p-3 text-xs text-zinc-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => setOpenId(o.id)}>
                        {t.orders.details}
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => setCancelId(o.id)}>
                        {t.orders.cancelOrder}
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
        <p className="text-xs text-zinc-500">
          Sahifa {list.data?.meta?.page ?? page} / {totalPages} · Jami {list.data?.meta?.total ?? 0}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Oldingi
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi
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
        title="Buyurtmani bekor qilish?"
        description="Holat CANCELLED ga o'zgaradi."
        danger
        confirmText={t.orders.cancelOrder}
        onCancel={() => setCancelId(null)}
        onConfirm={cancelOrder}
      />

      {openId && (
        <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm font-semibold">{t.orders.assignCourier}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="rounded-lg border px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
              value={courierId}
              onChange={(e) => setCourierId(e.target.value)}
            >
              <option value="">Kuryer tanlang</option>
              {courierList.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.user?.fullName} {c.isOnline ? '(onlayn)' : ''}
                </option>
              ))}
            </select>
            <Button type="button" onClick={assignCourier} disabled={!courierId}>
              Biriktirish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
