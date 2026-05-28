'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

type AvailableOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  guestOrder: { deliveryAddress: string; phone: string };
  restaurant: { name: string };
};

export default function CourierPage() {
  const router = useRouter();
  const user = getUser();
  const token = getToken();
  const qc = useQueryClient();
  const [online, setOnline] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['courier-me'],
    queryFn: () =>
      api<{ isOnline: boolean; totalEarnings: string }>('/couriers/me', { token: token ?? undefined }),
    enabled: !!token,
  });

  const { data: available } = useQuery({
    queryKey: ['courier-available'],
    queryFn: () =>
      api<AvailableOrder[]>('/couriers/me/orders/available', { token: token ?? undefined }),
    enabled: !!token && online,
    refetchInterval: 10000,
  });

  const { data: earnings } = useQuery({
    queryKey: ['courier-earnings'],
    queryFn: () =>
      api<{ totalEarnings: number; completedAssignments: number }>('/couriers/me/earnings', {
        token: token ?? undefined,
      }),
    enabled: !!token,
  });

  const toggleOnline = useMutation({
    mutationFn: (isOnline: boolean) =>
      api('/couriers/me/online', {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ isOnline }),
      }),
    onSuccess: (_, isOnline) => {
      setOnline(isOnline);
      qc.invalidateQueries({ queryKey: ['courier-me'] });
    },
  });

  const acceptOrder = useMutation({
    mutationFn: (orderId: string) =>
      api(`/orders/${orderId}/accept`, { method: 'POST', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courier-available'] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/orders/${id}/status`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify({ status }),
      }),
  });

  useEffect(() => {
    if (profile) setOnline(profile.isOnline);
  }, [profile]);

  useEffect(() => {
    if (!token || user?.role !== 'COURIER') router.replace('/login');
    if (token && navigator.geolocation) {
      const watch = navigator.geolocation.watchPosition((pos) => {
        api('/couriers/me/location', {
          method: 'PATCH',
          token: token ?? undefined,
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        }).catch(() => undefined);
      });
      return () => navigator.geolocation.clearWatch(watch);
    }
  }, [token, user, router]);

  return (
    <DashboardShell title="Courier" nav={[{ href: '/courier', label: 'Deliveries' }]}>
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4 dark:border-white/10">
          <p className="text-xs opacity-60">Earnings</p>
          <p className="text-xl font-bold">{earnings?.totalEarnings?.toLocaleString() ?? 0} UZS</p>
        </div>
        <div className="rounded-xl border p-4 dark:border-white/10">
          <p className="text-xs opacity-60">Deliveries</p>
          <p className="text-xl font-bold">{earnings?.completedAssignments ?? 0}</p>
        </div>
      </div>

      <Button
        size="lg"
        variant={online ? 'danger' : 'primary'}
        onClick={() => toggleOnline.mutate(!online)}
      >
        {online ? 'Go offline' : 'Go online'}
      </Button>

      {online && (
        <ul className="mt-6 space-y-4">
          {available?.map((o) => (
            <li key={o.id} className="rounded-xl border p-4 dark:border-white/10">
              <p className="font-bold">#{o.orderNumber}</p>
              <p className="text-sm">{o.restaurant.name}</p>
              <p className="text-sm opacity-70">{o.guestOrder.deliveryAddress}</p>
              <p className="text-sm">{o.guestOrder.phone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="lg" onClick={() => acceptOrder.mutate(o.id)}>
                  Accept
                </Button>
                {o.status === 'COURIER_ASSIGNED' && (
                  <Button size="sm" onClick={() => updateStatus.mutate({ id: o.id, status: 'PICKED_UP' })}>
                    Picked up
                  </Button>
                )}
                {o.status === 'PICKED_UP' && (
                  <Button size="sm" onClick={() => updateStatus.mutate({ id: o.id, status: 'DELIVERING' })}>
                    Delivering
                  </Button>
                )}
                {o.status === 'DELIVERING' && (
                  <Button size="sm" onClick={() => updateStatus.mutate({ id: o.id, status: 'DELIVERED' })}>
                    Delivered
                  </Button>
                )}
              </div>
            </li>
          ))}
          {!available?.length && <p className="text-sm opacity-60">No available orders</p>}
        </ul>
      )}
    </DashboardShell>
  );
}
