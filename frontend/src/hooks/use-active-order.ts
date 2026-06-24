'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { api, getWsBase } from '@/lib/api';
import {
  clearActiveOrderToken,
  getActiveOrderToken,
  isActiveOrderStatus,
  setActiveOrderToken,
  type ActiveOrderRef,
} from '@/lib/active-order';
import { getTrackingHistory } from '@/lib/customer';

export type ActiveOrder = {
  orderNumber: string;
  status: string;
  total: number;
  trackingToken?: string;
  restaurant?: { name?: string } | null;
  business?: { name?: string } | null;
};

function applyTerminalOrder(
  status: string,
  token: string,
  queryClient: ReturnType<typeof useQueryClient>,
  setRef: (ref: ActiveOrderRef | null) => void,
) {
  if (!isActiveOrderStatus(status)) {
    clearActiveOrderToken();
    setRef(null);
    queryClient.removeQueries({ queryKey: ['active-order', token] });
  }
}

export function useActiveOrder() {
  const queryClient = useQueryClient();
  const [ref, setRef] = useState<ActiveOrderRef | null>(null);

  useEffect(() => {
    let active = getActiveOrderToken();
    if (!active) {
      const latest = getTrackingHistory()[0];
      if (latest) {
        setActiveOrderToken(latest.token, latest.orderNumber);
        active = { token: latest.token, orderNumber: latest.orderNumber, savedAt: latest.savedAt };
      }
    }
    setRef(active);
  }, []);

  const token = ref?.token;

  const query = useQuery({
    queryKey: ['active-order', token],
    queryFn: () => api<ActiveOrder>(`/orders/track/${token}`),
    enabled: !!token,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });

  useEffect(() => {
    const status = query.data?.status;
    if (!status || !token) return;
    applyTerminalOrder(status, token, queryClient, setRef);
  }, [query.data?.status, queryClient, token]);

  useEffect(() => {
    if (!token) return;
    let socket: Socket | null = null;

    socket = io(`${getWsBase()}/orders`, { transports: ['websocket', 'polling'] });

    const join = () => {
      socket?.emit('joinOrder', token);
    };

    socket.on('connect', () => {
      join();
    });

    socket.io.on('reconnect', () => {
      join();
      void queryClient.invalidateQueries({ queryKey: ['active-order', token] });
    });

    socket.on('orderUpdated', (payload: ActiveOrder) => {
      queryClient.setQueryData(['active-order', token], payload);
      applyTerminalOrder(payload.status, token, queryClient, setRef);
    });

    if (socket.connected) {
      join();
    }

    return () => {
      socket?.disconnect();
    };
  }, [token, queryClient]);

  const isActive = !!token && !!query.data && isActiveOrderStatus(query.data.status);

  return {
    token,
    order: isActive ? query.data : null,
    isLoading: !!token && query.isLoading,
    isActive,
  };
}
