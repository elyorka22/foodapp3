'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getCustomerToken } from '@/lib/customer';

export type CustomerNotification = {
  id: string;
  userId: string;
  accountType: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export function useCustomerNotifications() {
  const token = getCustomerToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['customer-notifications'],
    queryFn: () =>
      api<CustomerNotification[]>('/notifications', {
        token: token ?? undefined,
      }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const unread = useQuery({
    queryKey: ['customer-notifications-unread'],
    queryFn: () =>
      api<{ count: number }>('/notifications/unread-count', {
        token: token ?? undefined,
      }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      api(`/notifications/${id}/read`, {
        method: 'PATCH',
        token: token ?? undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-notifications'] });
      qc.invalidateQueries({ queryKey: ['customer-notifications-unread'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      api('/notifications/read-all', {
        method: 'POST',
        token: token ?? undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-notifications'] });
      qc.invalidateQueries({ queryKey: ['customer-notifications-unread'] });
    },
  });

  return { list, unread, markRead, markAllRead, token };
}
