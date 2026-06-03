'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getToken, getUser } from '@/lib/auth';
import { useAdminCouriers, type CourierForm } from '@/hooks/use-admin-couriers';
import { ActiveBadge } from '@/components/admin/active-badge';
import { Modal } from '@/components/admin/modal';
import { SearchInput } from '@/components/admin/filters';
import { EmptyState } from '@/components/admin/ui';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const emptyForm: CourierForm & { password: string } = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  vehicleType: '',
};

export default function AdminCouriersPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [onlineFilter, setOnlineFilter] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isActive = activeFilter === '' ? undefined : activeFilter === 'active';
  const isOnline = onlineFilter === '' ? undefined : onlineFilter === 'online';

  const { list, create, update, updateStatus } = useAdminCouriers({
    page,
    limit: 20,
    search: search || undefined,
    isActive,
    isOnline,
  });

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/staff/login');
  }, [token, user, router]);

  const rows = list.data?.data ?? [];
  const totalPages = list.data?.meta?.totalPages ?? 1;

  const submitCreate = async () => {
    try {
      await create.mutateAsync(form);
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success('Courier created');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create');
    }
  };

  const submitEdit = async () => {
    if (!editRow) return;
    const { password, ...body } = form;
    try {
      await update.mutateAsync({ id: editRow.id, body });
      setEditRow(null);
      setForm(emptyForm);
      toast.success('Courier updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const toggleActive = async (row: any) => {
    try {
      await updateStatus.mutateAsync({ id: row.id, isActive: !row.user?.isActive });
      toast.success(row.user?.isActive ? 'Courier deactivated' : 'Courier activated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const toggleOnline = async (row: any) => {
    try {
      await updateStatus.mutateAsync({ id: row.id, isOnline: !row.isOnline });
      toast.success(row.isOnline ? 'Set offline' : 'Set online');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const openEdit = (row: any) => {
    setEditRow(row);
    setForm({
      fullName: row.user?.fullName ?? '',
      phone: row.user?.phone ?? '',
      email: row.user?.email ?? '',
      password: '',
      vehicleType: row.vehicleType ?? '',
    });
  };

  const FormFields = (
    <div className="space-y-3">
      <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Input placeholder="Email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input placeholder="Vehicle type" value={form.vehicleType ?? ''} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} />
      {createOpen && (
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      )}
    </div>
  );

  if (list.isLoading) return <TableSkeleton rows={8} cols={7} />;

  if (list.isError) {
    return (
      <EmptyState
        title="Failed to load couriers"
        description={list.error instanceof Error ? list.error.message : 'Unknown error'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Couriers</h1>
        <Button type="button" onClick={() => { setForm(emptyForm); setCreateOpen(true); }}>
          Add courier
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, phone, email" />
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          >
            <option value="">All account status</option>
            <option value="active">Active accounts</option>
            <option value="inactive">Inactive accounts</option>
          </select>
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={onlineFilter}
            onChange={(e) => { setOnlineFilter(e.target.value); setPage(1); }}
          >
            <option value="">All online status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <Button type="button" variant="secondary" onClick={() => { setSearch(''); setActiveFilter(''); setOnlineFilter(''); setPage(1); }}>
            Reset
          </Button>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No couriers" description="Add a courier to get started." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-3">Courier</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Online</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Earnings</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t dark:border-white/10">
                  <td className="px-4 py-3">
                    <Link href={`/admin/couriers/${r.id}`} className="font-medium hover:underline">
                      {r.user?.fullName ?? '—'}
                    </Link>
                    <p className="text-xs opacity-50">{r.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={r.user?.isActive ?? false} />
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={r.isOnline} label={r.isOnline ? 'Online' : 'Offline'} />
                  </td>
                  <td className="px-4 py-3">{r.stats?.completedOrders ?? 0}</td>
                  <td className="px-4 py-3">{Number(r.totalEarnings ?? 0).toLocaleString()} UZS</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => toggleOnline(r)}>
                        {r.isOnline ? 'Offline' : 'Online'}
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => toggleActive(r)}>
                        {r.user?.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm opacity-70">Page {page} of {totalPages}</span>
          <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Modal open={createOpen} title="Add courier" onClose={() => setCreateOpen(false)}>
        {FormFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button type="button" onClick={submitCreate} disabled={create.isPending}>Create</Button>
        </div>
      </Modal>

      <Modal open={!!editRow} title="Edit courier" onClose={() => setEditRow(null)}>
        {FormFields}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setEditRow(null)}>Cancel</Button>
          <Button type="button" onClick={submitEdit} disabled={update.isPending}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
