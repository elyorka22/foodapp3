'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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

function resolveActiveOrderRef(): ActiveOrderRef | null {
  if (typeof window === 'undefined') return null;
  let active = getActiveOrderToken();
  if (!active) {
    const latest = getTrackingHistory()[0];
    if (!latest) return null;
    setActiveOrderToken(latest.token, latest.orderNumber);
    active = { token: latest.token, orderNumber: latest.orderNumber, savedAt: latest.savedAt };
  }
  return active;
}

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
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [ref, setRef] = useState<ActiveOrderRef | null>(null);

  useEffect(() => {
    const active = resolveActiveOrderRef();
    setRef(active);
    if (active?.token) {
      void queryClient.invalidateQueries({ queryKey: ['active-order', active.token] });
    }
  }, [pathname, queryClient]);

  const token = ref?.token;

  const query = useQuery({
    queryKey: ['active-order', token],
    queryFn: () => api<ActiveOrder>(`/orders/track/${token}`),
    enabled: !!token,
    staleTime: 30_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
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

  const isTerminal = !!query.data?.status && !isActiveOrderStatus(query.data.status);
  const isActive = !!token && !isTerminal;

  return {
    token,
    order: query.data && !isTerminal ? query.data : null,
    orderNumber: query.data?.orderNumber ?? ref?.orderNumber,
    isLoading: !!token && query.isLoading && !query.data,
    isActive,
  };
}
