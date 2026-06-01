'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { logApiFetch } from '@/lib/api-fetch-log';
import { getToken } from '@/lib/auth';
import { adminListQueryOptions } from '@/lib/react-query-options';

export type AdminBusinessType = {
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
};

export type BusinessTypeForm = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  sortOrder?: number;
};

const QUERY_KEY = ['admin-business-types'] as const;
const ADMIN_PATH = '/business-types/admin';

export function useAdminBusinessTypes() {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => {
      logApiFetch('GET', ADMIN_PATH, 'react-query:queryFn (mount or invalidate)');
      return api<AdminBusinessType[]>(ADMIN_PATH, { token: token ?? undefined });
    },
    enabled: !!token,
    ...adminListQueryOptions,
  });

  const create = useMutation({
    mutationFn: (body: BusinessTypeForm) => {
      logApiFetch('POST', '/business-types', 'mutation:create');
      return api('/business-types', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      logApiFetch('GET', ADMIN_PATH, 'mutation:create → invalidateQueries');
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: BusinessTypeForm }) => {
      logApiFetch('PATCH', `/business-types/${id}`, 'mutation:update');
      return api(`/business-types/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      logApiFetch('GET', ADMIN_PATH, 'mutation:update → invalidateQueries');
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => {
      logApiFetch('DELETE', `/business-types/${id}`, 'mutation:remove');
      return api(`/business-types/${id}`, { method: 'DELETE', token: token ?? undefined });
    },
    onSuccess: () => {
      logApiFetch('GET', ADMIN_PATH, 'mutation:remove → invalidateQueries');
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return { list, create, update, remove };
}
