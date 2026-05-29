'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminCouriersQuery = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  isOnline?: boolean;
};

export type CourierForm = {
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  vehicleType?: string;
};

export function useAdminCouriers(query: AdminCouriersQuery) {
  const token = getToken();
  const qc = useQueryClient();

  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive));
  if (query.isOnline !== undefined) params.set('isOnline', String(query.isOnline));

  const list = useQuery({
    queryKey: ['admin-couriers', query],
    queryFn: () =>
      api<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/couriers?${params.toString()}`,
        { token: token ?? undefined },
      ),
    enabled: !!token,
  });

  const create = useMutation({
    mutationFn: (body: CourierForm & { password: string }) =>
      api('/couriers', { method: 'POST', token: token ?? undefined, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-couriers'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CourierForm> }) =>
      api(`/couriers/${id}`, { method: 'PATCH', token: token ?? undefined, body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-couriers'] });
      qc.invalidateQueries({ queryKey: ['admin-courier'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, isActive, isOnline }: { id: string; isActive?: boolean; isOnline?: boolean }) =>
      api(`/couriers/${id}/status`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ isActive, isOnline }),
      }),
    onMutate: async ({ id, isActive, isOnline }) => {
      await qc.cancelQueries({ queryKey: ['admin-couriers'] });
      const prev = qc.getQueriesData({ queryKey: ['admin-couriers'] });
      qc.setQueriesData<{ data: any[]; meta: any }>({ queryKey: ['admin-couriers'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...(isOnline !== undefined && { isOnline }),
                  ...(isActive !== undefined && { user: { ...c.user, isActive } }),
                }
              : c,
          ),
        };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin-couriers'] });
      qc.invalidateQueries({ queryKey: ['admin-courier'] });
    },
  });

  return { list, create, update, updateStatus };
}

export function useAdminCourier(id: string) {
  const token = getToken();

  const detail = useQuery({
    queryKey: ['admin-courier', id],
    queryFn: () => api<any>(`/couriers/${id}`, { token: token ?? undefined }),
    enabled: !!token && !!id,
  });

  const history = useQuery({
    queryKey: ['admin-courier-history', id],
    queryFn: () => api<any[]>(`/couriers/${id}/history`, { token: token ?? undefined }),
    enabled: !!token && !!id,
  });

  return { detail, history };
}
