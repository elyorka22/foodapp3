'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export function useAdminCategories(restaurantId?: string) {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['admin-categories', restaurantId],
    queryFn: () =>
      api<any[]>(`/categories?restaurantId=${restaurantId}&includeInactive=true`, {
        token: token ?? undefined,
      }),
    enabled: !!token && !!restaurantId,
  });

  const create = useMutation({
    mutationFn: (body: { restaurantId: string; name: string; slug: string }) =>
      api('/categories', { method: 'POST', token: token ?? undefined, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; slug?: string; isActive?: boolean } }) =>
      api(`/categories/${id}`, { method: 'PATCH', token: token ?? undefined, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/categories/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  return { list, create, update, remove };
}
