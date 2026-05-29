'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type PromoCodeForm = {
  code: string;
  type: 'FIXED' | 'PERCENTAGE';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
};

export type PromoCode = PromoCodeForm & {
  id: string;
  usageCount: number;
  createdAt: string;
};

export function useAdminPromoCodes() {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['admin-promo-codes'],
    queryFn: () => api<PromoCode[]>('/promo-codes', { token: token ?? undefined }),
    enabled: !!token,
  });

  const create = useMutation({
    mutationFn: (body: PromoCodeForm) =>
      api<PromoCode>('/promo-codes', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promo-codes'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<PromoCodeForm> }) =>
      api<PromoCode>(`/promo-codes/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promo-codes'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/promo-codes/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promo-codes'] }),
  });

  return { list, create, update, remove };
}
