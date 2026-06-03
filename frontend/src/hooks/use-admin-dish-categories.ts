'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { adminListQueryOptions } from '@/lib/react-query-options';

export type AdminDishCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
};

export type DishCategoryForm = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  sortOrder?: number;
  isActive?: boolean;
};

const QUERY_KEY = ['admin-dish-categories'] as const;
const ADMIN_PATH = '/dish-categories/admin';

export function useAdminDishCategories() {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api<AdminDishCategory[]>(ADMIN_PATH, { token: token ?? undefined }),
    enabled: !!token,
    ...adminListQueryOptions,
  });

  const create = useMutation({
    mutationFn: (body: DishCategoryForm) =>
      api('/dish-categories', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DishCategoryForm> }) =>
      api(`/dish-categories/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/dish-categories/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return { list, create, update, remove };
}

/** @deprecated use useAdminDishCategories — categories are global now */
export function useAdminCategories(_restaurantId?: string) {
  return useAdminDishCategories();
}
