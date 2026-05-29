'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminSettings = {
  app_name: string;
  support_phone: string;
  support_telegram: string;
  support_email: string;
  min_order_amount: number;
  free_delivery_threshold: number;
  default_delivery_fee: number;
  commission_default: number;
};

export function useAdminSettings() {
  const token = getToken();
  const qc = useQueryClient();

  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<AdminSettings>('/settings/admin', { token: token ?? undefined }),
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: (body: Partial<AdminSettings>) =>
      api<AdminSettings>('/settings/admin', {
        method: 'PUT',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['admin-settings'], data);
    },
  });

  return { settings, save };
}
