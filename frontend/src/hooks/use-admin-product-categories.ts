'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type StoreCategoryForm = {
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export function useAdminProductCategories(businessId: string | undefined) {
  const token = getToken();
  const qc = useQueryClient();
  const queryKey = ['admin-product-categories', businessId] as const;

  const list = useQuery({
    queryKey,
    queryFn: () =>
      api<StoreCategory[]>(
        `/categories?restaurantId=${businessId}&includeInactive=true`,
        { token: token ?? undefined },
      ),
    enabled: !!token && !!businessId,
  });

  const create = useMutation({
    mutationFn: (body: StoreCategoryForm) =>
      api('/categories', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ ...body, restaurantId: businessId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<StoreCategoryForm> }) =>
      api(`/categories/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/categories/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return { list, create, update, remove };
}
