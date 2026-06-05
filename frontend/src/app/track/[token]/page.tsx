'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api, getWsBase } from '@/lib/api';
import { saveTrackingToken } from '@/lib/customer';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import { OrderLineItems } from '@/components/orders/order-line-items';

type TrackCourier = {
  name?: string | null;
  phone?: string | null;
  user?: { fullName?: string | null; phone?: string | null } | null;
};

type Order = {
  orderNumber: string;
  status: string;
  subtotal?: number;
  deliveryFee?: number;
  distanceKm?: number | null;
  total: number;
  items: { name: string; description?: string | null; quantity: number }[];
  courier?: TrackCourier | null;
};

function courierName(courier: TrackCourier | null | undefined): string | null {
  if (!courier) return null;
  return courier.name ?? courier.user?.fullName ?? null;
}

function courierPhone(courier: TrackCourier | null | undefined): string | null {
  if (!courier) return null;
  return courier.phone ?? courier.user?.phone ?? null;
}

export default function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let socket: Socket | null = null;

    api<Order>(`/orders/track/${token}`)
      .then((o) => {
        setOrder(o);
        saveTrackingToken(token, o.orderNumber);
      })
      .catch(() => setError(uz.orderNotFound));

    socket = io(`${getWsBase()}/orders`, { transports: ['websocket', 'polling'] });
    socket.emit('joinOrder', token);
    socket.on('orderUpdated', (payload: Order) => setOrder(payload));

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  if (error) return <main className="p-4 text-red-500">{error}</main>;
  if (!order) return <main className="p-4 text-zinc-500">{uz.loading}</main>;

  const statusLabel = uz.orderStatus[order.status] ?? order.status;
  const name = courierName(order.courier);
  const phone = courierPhone(order.courier);

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold">{uz.orderNumber(order.orderNumber)}</h1>
      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-card">
        <p className="text-2xl font-semibold text-brand-600">{statusLabel}</p>
        <p className="mt-2 text-sm text-zinc-500">{uz.liveUpdates}</p>
      </div>

      {(name || phone || order.deliveryFee != null || order.distanceKm != null) && (
        <div className="mt-4 rounded-2xl border bg-white p-4 text-sm shadow-card">
          {name && (
            <p>
              <span className="text-zinc-500">Kuryer: </span>
              <span className="font-medium">{name}</span>
            </p>
          )}
          {phone && (
            <p className="mt-1">
              <span className="text-zinc-500">Telefon: </span>
              <span>{phone}</span>
            </p>
          )}
          {order.deliveryFee != null && (
            <p className="mt-1">
              <span className="text-zinc-500">{uz.deliveryLabel}: </span>
              <span>{formatSum(order.deliveryFee)}</span>
            </p>
          )}
          {order.distanceKm != null && (
            <p className="mt-1">
              <span className="text-zinc-500">Masofa: </span>
              <span>{order.distanceKm} km</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        <OrderLineItems items={order.items ?? []} />
      </div>
      {order.subtotal != null && (
        <p className="mt-4 flex justify-between text-sm">
          <span>Mahsulotlar</span>
          <span>{formatSum(order.subtotal)}</span>
        </p>
      )}
      {order.deliveryFee != null && (
        <p className="mt-1 flex justify-between text-sm text-zinc-600">
          <span>{uz.deliveryLabel}</span>
          <span>{formatSum(order.deliveryFee)}</span>
        </p>
      )}
      <p className="mt-2 flex justify-between font-bold">
        <span>{uz.total}</span>
        <span>{formatSum(order.total)}</span>
      </p>
    </main>
  );
}
