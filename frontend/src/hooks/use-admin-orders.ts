'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminOrdersQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  statusGroup?: 'active' | 'cancelled';
  vertical?: 'restaurant' | 'store';
  dateFrom?: string;
  dateTo?: string;
  restaurantId?: string;
};

export function useAdminOrders(query: AdminOrdersQuery) {
  const token = getToken();
  const qc = useQueryClient();

  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  if (query.statusGroup) params.set('statusGroup', query.statusGroup);
  if (query.vertical) params.set('vertical', query.vertical);
  if (query.restaurantId) params.set('restaurantId', query.restaurantId);
  if (query.dateFrom) params.set('dateFrom', new Date(`${query.dateFrom}T00:00:00.000Z`).toISOString());
  if (query.dateTo) params.set('dateTo', new Date(`${query.dateTo}T23:59:59.999Z`).toISOString());

  const list = useQuery({
    queryKey: ['admin-orders', query],
    queryFn: () => api<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/orders?${params.toString()}`, { token: token ?? undefined }),
    enabled: !!token,
    refetchInterval: 15000,
  });

  const getOne = (id: string) =>
    api<any>(`/orders/${id}`, { token: token ?? undefined });

  const getHistory = (id: string) =>
    api<any[]>(`/orders/${id}/history`, { token: token ?? undefined });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, cancelReason, courierId }: { id: string; status: string; cancelReason?: string; courierId?: string }) =>
      api(`/orders/${id}/status`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ status, cancelReason, courierId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const assignCourier = useMutation({
    mutationFn: ({ id, courierId, note }: { id: string; courierId: string; note?: string }) =>
      api(`/orders/${id}/assign-courier`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ courierId, note }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const reassignCourier = useMutation({
    mutationFn: ({ id, courierId, note }: { id: string; courierId: string; note?: string }) =>
      api(`/orders/${id}/reassign-courier`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ courierId, note }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const removeCourier = useMutation({
    mutationFn: (id: string) =>
      api(`/orders/${id}/remove-courier`, {
        method: 'PATCH',
        token: token ?? undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  return { list, getOne, getHistory, updateStatus, assignCourier, reassignCourier, removeCourier };
}

