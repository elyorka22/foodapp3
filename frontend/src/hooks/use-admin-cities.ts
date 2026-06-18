'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { adminListQueryOptions } from '@/lib/react-query-options';

export type AdminCity = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
};

export type CityForm = {
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
  isDefault?: boolean;
};

const QUERY_KEY = ['admin-cities'] as const;
const ADMIN_PATH = '/cities/admin';

export function useAdminCities() {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api<AdminCity[]>(ADMIN_PATH, { token: token ?? undefined }),
    enabled: !!token,
    ...adminListQueryOptions,
  });

  const create = useMutation({
    mutationFn: (body: CityForm) =>
      api('/cities', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['cities'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CityForm> }) =>
      api(`/cities/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['cities'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/cities/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['cities'] });
    },
  });

  return { list, create, update, remove };
}
