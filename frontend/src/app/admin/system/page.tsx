'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { LoadingState, StatCard, EmptyState } from '@/components/admin/ui';

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
  );
}

export default function AdminSystemPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/staff/login');
  }, [token, user, router]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-system'],
    queryFn: () =>
      api<{
        api: string;
        database: string;
        redis: string;
        storage: string;
        version: string;
        environment: string;
        build: string;
        timestamp: string;
      }>('/health/system', { token: token ?? undefined }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  if (isLoading) return <LoadingState label="Checking system health..." />;

  if (isError) {
    return (
      <EmptyState
        title="Failed to load system status"
        description={error instanceof Error ? error.message : 'Unknown error'}
        action={
          <button type="button" className="text-sm font-semibold text-brand-600" onClick={() => refetch()}>
            Retry
          </button>
        }
      />
    );
  }

  if (!data) return <EmptyState title="No data" />;

  const healthy = data.database === 'ok' && data.redis === 'ok' && data.storage !== 'error';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">System health</h1>
        <div className="flex items-center gap-2 text-sm">
          <StatusDot ok={healthy} />
          {healthy ? 'All systems operational' : 'Degraded'}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="API" value={data.api} />
        <StatCard label="Database" value={data.database} />
        <StatCard label="Redis" value={data.redis} />
        <StatCard label="Storage" value={data.storage} />
        <StatCard label="Version" value={data.version} />
        <StatCard label="Environment" value={data.environment} />
        <StatCard label="Build" value={data.build} />
        <StatCard label="Last check" value={new Date(data.timestamp).toLocaleTimeString()} />
      </div>
    </div>
  );
}
