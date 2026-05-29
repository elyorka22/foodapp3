'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { getAdminSocket } from '@/lib/admin-socket';
import { useEffect } from 'react';

export function useAdminNotifications() {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => api<any[]>('/admin-notifications', { token: token ?? undefined }),
    enabled: !!token,
    refetchInterval: 60_000,
  });

  const unread = useQuery({
    queryKey: ['admin-notifications-unread'],
    queryFn: () => api<{ count: number }>('/admin-notifications/unread-count', { token: token ?? undefined }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!token) return;
    const s = getAdminSocket(token);
    if (!s) return;
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
      qc.invalidateQueries({ queryKey: ['admin-notifications-unread'] });
    };
    s.on('notification', refresh);
    return () => {
      s.off('notification', refresh);
    };
  }, [token, qc]);

  const markRead = useMutation({
    mutationFn: (id: string) =>
      api(`/admin-notifications/${id}/read`, { method: 'PATCH', token: token ?? undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
      qc.invalidateQueries({ queryKey: ['admin-notifications-unread'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () =>
      api('/admin-notifications/read-all', { method: 'POST', token: token ?? undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
      qc.invalidateQueries({ queryKey: ['admin-notifications-unread'] });
    },
  });

  return { list, unread, markRead, markAllRead };
}
