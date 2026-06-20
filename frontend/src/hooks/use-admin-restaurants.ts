'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminRestaurantsQuery = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  vertical?: 'restaurant' | 'store';
};

export type RestaurantForm = {
  name: string;
  slug: string;
  businessTypeId?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  coverPositionX?: number;
  coverPositionY?: number;
  coverScale?: number;
  phone?: string;
  commissionRate?: number;
  isActive?: boolean;
  branchAddress?: string;
  latitude?: number;
  longitude?: number;
  ownerLogin?: string;
  ownerPassword?: string;
  ownerFullName?: string;
};

export function useAdminRestaurants(query: AdminRestaurantsQuery) {
  const token = getToken();
  const qc = useQueryClient();

  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive));
  if (query.vertical) params.set('vertical', query.vertical);

  const list = useQuery({
    queryKey: ['admin-restaurants', query],
    queryFn: () =>
      api<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/restaurants/admin?${params.toString()}`,
        { token: token ?? undefined },
      ),
    enabled: !!token,
  });

  const create = useMutation({
    mutationFn: (body: RestaurantForm) =>
      api<{ approvalStatus?: string; isActive?: boolean }>('/restaurants', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<RestaurantForm> }) =>
      api(`/restaurants/${id}`, { method: 'PATCH', token: token ?? undefined, body: JSON.stringify(body) }),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['admin-restaurants'] });
      const prev = qc.getQueriesData({ queryKey: ['admin-restaurants'] });
      qc.setQueriesData<{ data: any[]; meta: any }>({ queryKey: ['admin-restaurants'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((r) => (r.id === id ? { ...r, ...body } : r)),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
      qc.invalidateQueries({ queryKey: ['admin-restaurant'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/restaurants/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-restaurants'] }),
  });

  const updateApproval = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      api(`/restaurants/${id}/approval`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ status, note }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
      qc.invalidateQueries({ queryKey: ['admin-restaurant'] });
    },
  });

  return { list, create, update, remove, updateApproval };
}

export function useAdminRestaurant(id: string) {
  const token = getToken();

  const detail = useQuery({
    queryKey: ['admin-restaurant', id],
    queryFn: () => api<any>(`/restaurants/${id}`, { token: token ?? undefined }),
    enabled: !!token && !!id,
  });

  const stats = useQuery({
    queryKey: ['admin-restaurant-stats', id],
    queryFn: () => api<any>(`/restaurants/${id}/stats`, { token: token ?? undefined }),
    enabled: !!token && !!id,
  });

  return { detail, stats };
}
