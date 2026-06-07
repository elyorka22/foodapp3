'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type PushAudience =
  | 'CUSTOMERS'
  | 'COURIERS'
  | 'STAFF'
  | 'ALL'
  | 'USER';

export type PushSendForm = {
  audience: PushAudience;
  title: string;
  body: string;
  templateCode?: 'SYSTEM' | 'PROMOTION';
  userId?: string;
  accountType?: 'CUSTOMER' | 'STAFF';
  userRole?: string;
};

export type PushStats = {
  customers: { users: number; devicesWithToken: number };
  couriers: { users: number; devicesWithToken: number };
  staff: { users: number; devicesWithToken: number };
};

export function useAdminPush() {
  const token = getToken();
  const qc = useQueryClient();

  const audiences = useQuery({
    queryKey: ['admin-push-audiences'],
    queryFn: () =>
      api<{ audiences: PushAudience[] }>('/notifications/admin/push/audiences', {
        token: token ?? undefined,
      }),
    enabled: !!token,
  });

  const stats = useQuery({
    queryKey: ['admin-push-stats'],
    queryFn: () =>
      api<PushStats>('/notifications/admin/push/stats', { token: token ?? undefined }),
    enabled: !!token,
  });

  const send = useMutation({
    mutationFn: (body: PushSendForm) =>
      api<{ ok: boolean; recipients: number; delivered: number }>(
        '/notifications/admin/push/send',
        {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify(body),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-push-stats'] });
    },
  });

  return { audiences, stats, send };
}
