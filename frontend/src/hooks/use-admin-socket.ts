'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAdminSocket } from '@/lib/admin-socket';
import { getToken } from '@/lib/auth';

export function useAdminSocket() {
  const qc = useQueryClient();
  const token = getToken();

  useEffect(() => {
    if (!token) return;

    const s = getAdminSocket(token);
    if (!s) return;

    const invalidateOrders = () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    };

    s.on('newOrder', invalidateOrders);
    s.on('orderUpdated', invalidateOrders);

    return () => {
      s.off('newOrder', invalidateOrders);
      s.off('orderUpdated', invalidateOrders);
    };
  }, [token, qc]);
}
