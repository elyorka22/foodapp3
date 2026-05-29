'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { StatCard, LoadingState, EmptyState } from '@/components/admin/ui';

export default function RestaurantFinancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = getUser();
  const token = getToken();

  useEffect(() => {
    if (!token || user?.role !== 'SUPER_ADMIN') router.replace('/login');
  }, [token, user, router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['restaurant-finance', id],
    queryFn: () => api<any>(`/restaurants/${id}/finance`, { token: token ?? undefined }),
    enabled: !!token && !!id,
  });

  if (isLoading) return <LoadingState label="Loading finance data..." />;

  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load finance"
        description={error instanceof Error ? error.message : undefined}
        action={<Link href={`/admin/restaurants/${id}`} className="text-sm underline">Back</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/restaurants/${id}`} className="text-xs opacity-60 hover:underline">← Restaurant</Link>
        <h1 className="mt-1 text-lg font-semibold">Finance — {data.restaurantName}</h1>
        <p className="text-sm opacity-60">Commission rate: {data.commissionRate}%</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Completed orders" value={data.completedOrders} />
        <StatCard label="Gross revenue" value={`${Number(data.grossRevenue).toLocaleString()} UZS`} />
        <StatCard label="Platform commission" value={`${Number(data.platformCommission).toLocaleString()} UZS`} />
        <StatCard label="Net restaurant revenue" value={`${Number(data.netRestaurantRevenue).toLocaleString()} UZS`} />
        <StatCard label="Total order value" value={`${Number(data.totalOrderValue).toLocaleString()} UZS`} />
      </div>
    </div>
  );
}
