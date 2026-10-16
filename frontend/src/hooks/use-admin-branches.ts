'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminBranch = {
  id: string;
  name: string;
  address: string;
  cityId: string;
  latitude: number | string;
  longitude: number | string;
  phone?: string | null;
  isActive: boolean;
  isPrimary: boolean;
  city?: { id: string; name: string; slug: string } | null;
};

export type BranchForm = {
  name: string;
  address: string;
  cityId: string;
  latitude: number;
  longitude: number;
  phone?: string;
  isActive?: boolean;
  isPrimary?: boolean;
};

export function useAdminBranches(businessId: string) {
  const token = getToken();
  const qc = useQueryClient();
  const key = ['admin-branches', businessId] as const;

  const list = useQuery({
    queryKey: key,
    queryFn: () =>
      api<AdminBranch[]>(`/businesses/${businessId}/branches`, {
        token: token ?? undefined,
      }),
    enabled: !!token && !!businessId,
  });

  const create = useMutation({
    mutationFn: (body: BranchForm) =>
      api(`/businesses/${businessId}/branches`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<BranchForm> }) =>
      api(`/businesses/${businessId}/branches/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });

  const setPrimary = useMutation({
    mutationFn: (id: string) =>
      api(`/businesses/${businessId}/branches/${id}/primary`, {
        method: 'POST',
        token: token ?? undefined,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/businesses/${businessId}/branches/${id}`, {
        method: 'DELETE',
        token: token ?? undefined,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });

  return { list, create, update, setPrimary, remove };
}
