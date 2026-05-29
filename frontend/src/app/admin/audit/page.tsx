'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { DateRangeFilter, SearchInput } from '@/components/admin/filters';
import { EmptyState, LoadingState } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';

export default function AdminAuditPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', '30');
  if (entity) params.set('entity', entity);
  if (action) params.set('action', action);
  if (userId) params.set('userId', userId);
  if (from) params.set('dateFrom', from);
  if (to) params.set('dateTo', to);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-audit', page, entity, action, userId, from, to],
    queryFn: () =>
      api<{ data: any[]; meta: { totalPages: number } }>(`/audit?${params.toString()}`, {
        token: token ?? undefined,
      }),
    enabled: !!token,
  });

  if (isLoading) return <LoadingState label="Loading audit log..." />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load audit log"
        description={error instanceof Error ? error.message : 'Unknown error'}
      />
    );
  }

  const rows = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Audit log</h1>

      <div className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-3">
          <SearchInput value={action} onChange={setAction} placeholder="Filter by action" />
          <select
            className="rounded-lg border px-3 py-3 text-sm dark:border-white/20 dark:bg-zinc-900"
            value={entity}
            onChange={(e) => { setEntity(e.target.value); setPage(1); }}
          >
            <option value="">All entities</option>
            {['restaurant', 'product', 'courier', 'customer', 'banner', 'settings'].map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <SearchInput value={userId} onChange={(v) => { setUserId(v); setPage(1); }} placeholder="User ID" />
          <DateRangeFilter from={from} to={to} onChange={(v) => { setFrom(v.from); setTo(v.to); setPage(1); }} />
          <Button type="button" variant="secondary" onClick={() => { setEntity(''); setAction(''); setUserId(''); setFrom(''); setTo(''); setPage(1); }}>
            Reset
          </Button>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No audit entries" description="Actions will appear here as admins make changes." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:border-white/10 dark:bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead className="text-xs opacity-60">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t dark:border-white/10">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.user?.fullName ?? r.user?.email ?? '—'}</td>
                  <td className="px-4 py-3">{r.action}</td>
                  <td className="px-4 py-3">{r.entity}{r.entityId ? ` · ${r.entityId.slice(0, 8)}…` : ''}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-xs opacity-70">
                    {r.metadata ? JSON.stringify(r.metadata) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm opacity-70">Page {page} of {totalPages}</span>
          <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
