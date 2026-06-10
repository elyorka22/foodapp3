'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { unwrapList } from '@/lib/list-utils';
import type { OrderRow } from '@/components/orders/order-table';

type OrdersListResponse = { data: OrderRow[]; meta?: unknown };

export function useStaffOrders(status?: string) {
  const token = getToken();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', status],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (status) params.set('status', status);
      return api<OrdersListResponse>(`/orders?${params}`, { token: token ?? undefined });
    },
    enabled: !!token,
    refetchInterval: 15000,
  });

  const orders = unwrapList(query.data);

  const updateStatus = useMutation({
    mutationFn: ({ id, status: newStatus }: { id: string; status: string }) =>
      api(`/orders/${id}/status`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const requestCourier = useMutation({
    mutationFn: (id: string) =>
      api(`/orders/${id}/request-courier`, {
        method: 'POST',
        token: token ?? undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  return { ...query, orders, updateStatus, requestCourier };
}
