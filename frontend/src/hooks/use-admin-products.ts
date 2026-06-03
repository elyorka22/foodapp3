'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminProductsQuery = {
  page: number;
  limit: number;
  search?: string;
  restaurantId?: string;
  categoryId?: string;
  isAvailable?: boolean;
  vertical?: 'restaurant' | 'store';
};

export type ProductForm = {
  restaurantId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
};

export function useAdminProducts(query: AdminProductsQuery) {
  const token = getToken();
  const qc = useQueryClient();

  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.restaurantId) params.set('restaurantId', query.restaurantId);
  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.isAvailable !== undefined) params.set('isAvailable', String(query.isAvailable));
  if (query.vertical) params.set('vertical', query.vertical);

  const list = useQuery({
    queryKey: ['admin-products', query],
    queryFn: () =>
      api<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/products/admin?${params.toString()}`,
        { token: token ?? undefined },
      ),
    enabled: !!token,
  });

  const create = useMutation({
    mutationFn: (body: ProductForm) =>
      api('/products', { method: 'POST', token: token ?? undefined, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ProductForm> }) =>
      api(`/products/${id}`, { method: 'PATCH', token: token ?? undefined, body: JSON.stringify(body) }),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['admin-products'] });
      const prev = qc.getQueriesData({ queryKey: ['admin-products'] });
      qc.setQueriesData<{ data: any[]; meta: any }>({ queryKey: ['admin-products'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((p) => (p.id === id ? { ...p, ...body } : p)),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/products/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const bulk = useMutation({
    mutationFn: ({ action, ids }: { action: 'activate' | 'deactivate' | 'delete'; ids: string[] }) =>
      api('/products/bulk', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ action, ids }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const addImage = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      api(`/products/${id}/image`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ url }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  return { list, create, update, remove, bulk, addImage };
}
