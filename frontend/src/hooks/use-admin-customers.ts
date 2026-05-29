'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminCustomersQuery = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
};

export function useAdminCustomers(query: AdminCustomersQuery) {
  const token = getToken();
  const qc = useQueryClient();

  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive));

  const list = useQuery({
    queryKey: ['admin-customers', query],
    queryFn: () =>
      api<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/customers/admin?${params.toString()}`,
        { token: token ?? undefined },
      ),
    enabled: !!token,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api(`/customers/${id}/status`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ isActive }),
      }),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: ['admin-customers'] });
      const prev = qc.getQueriesData({ queryKey: ['admin-customers'] });
      qc.setQueriesData<{ data: any[]; meta: any }>({ queryKey: ['admin-customers'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((c) => (c.id === id ? { ...c, isActive } : c)),
        };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      qc.invalidateQueries({ queryKey: ['admin-customer'] });
    },
  });

  return { list, updateStatus };
}

export function useAdminCustomer(id: string) {
  const token = getToken();

  const detail = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => api<any>(`/customers/admin/${id}`, { token: token ?? undefined }),
    enabled: !!token && !!id,
  });

  return { detail };
}
