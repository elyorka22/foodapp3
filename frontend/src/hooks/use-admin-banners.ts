'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type BannerForm = {
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  placement?: 'HERO' | 'PROMO';
  sortOrder?: number;
  isActive?: boolean;
};

export function useAdminBanners() {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => api<any[]>('/banners/admin', { token: token ?? undefined }),
    enabled: !!token,
  });

  const create = useMutation({
    mutationFn: (body: BannerForm) =>
      api('/banners', { method: 'POST', token: token ?? undefined, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<BannerForm> }) =>
      api(`/banners/${id}`, { method: 'PATCH', token: token ?? undefined, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/banners/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) =>
      api('/banners/admin/reorder', {
        method: 'PUT',
        token: token ?? undefined,
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  return { list, create, update, remove, reorder };
}
