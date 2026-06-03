'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getToken } from '@/lib/auth';
import { AdminPageGuard } from '@/components/admin/admin-page-guard';
import { adminI18n as t } from '@/lib/admin-i18n';
import { useAdminCustomers } from '@/hooks/use-admin-customers';
import { ActiveBadge } from '@/components/admin/active-badge';
import { SearchInput } from '@/components/admin/filters';
import { EmptyState } from '@/components/admin/ui';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { Button } from '@/components/ui/button';

export default function AdminCustomersPage() {
  const token = getToken();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const isActive =
    status === '' ? undefined : status === 'active' ? true : status === 'blocked' ? false : undefined;

  const { list, updateStatus } = useAdminCustomers({
    page,
    limit: 20,
    search: search || undefined,
    isActive,
  });

  const rows = list.data?.data ?? [];
  const totalPages = list.data?.meta?.totalPages ?? 1;

  const toggleBlock = async (row: any) => {
    try {
      await updateStatus.mutateAsync({ id: row.id, isActive: !row.isActive });
      toast.success(row.isActive ? 'Customer blocked' : 'Customer unblocked');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  if (list.isLoading) return <TableSkeleton rows={8} cols={6} />;

  if (list.isError) {
    return (
      <EmptyState
        title="Failed to load customers"
        description={list.error instanceof Error ? list.error.message : 'Unknown error'}
      />
    );
  }

  return (
    <AdminPageGuard permission="customers">
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{t.nav.customers}</h1>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, phone, email" />
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All customers</option>
            <option value="active">Active only</option>
            <option value="blocked">Blocked only</option>
          </select>
          <Button type="button" variant="secondary" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>
            Reset
          </Button>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No customers" description="Registered customers will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total spent</th>
                <th className="px-4 py-3">Last order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t dark:border-white/10">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${r.id}`} className="font-medium hover:underline">
                      {r.fullName}
                    </Link>
                    <p className="text-xs opacity-50">{r.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={r.isActive} label={r.isActive ? 'Active' : 'Blocked'} />
                  </td>
                  <td className="px-4 py-3">{r.stats?.totalOrders ?? 0}</td>
                  <td className="px-4 py-3">{Number(r.stats?.totalSpent ?? 0).toLocaleString()} UZS</td>
                  <td className="px-4 py-3">
                    {r.stats?.lastOrderDate
                      ? new Date(r.stats.lastOrderDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant={r.isActive ? 'danger' : 'primary'} onClick={() => toggleBlock(r)}>
                      {r.isActive ? 'Block' : 'Unblock'}
                    </Button>
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
    </div>
    </AdminPageGuard>
  );
}
