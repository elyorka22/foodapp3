'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getWsBase } from '@/lib/api';
import { getCustomerToken } from '@/lib/customer';

/**
 * Real-time notification center updates via WebSocket namespace `/notifications`.
 * Falls back to polling in useCustomerNotifications when socket is unavailable.
 */
export function useNotificationsSocket(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = getCustomerToken();
    if (!token) return;

    let socket: Socket | null = null;
    try {
      socket = io(`${getWsBase()}/notifications`, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socket.on('notification', () => {
        qc.invalidateQueries({ queryKey: ['customer-notifications'] });
        qc.invalidateQueries({ queryKey: ['customer-notifications-unread'] });
      });
    } catch {
      /* polling handles updates */
    }

    return () => {
      socket?.disconnect();
    };
  }, [enabled, qc]);
}
