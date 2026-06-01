'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api, getWsBase } from '@/lib/api';
import { saveTrackingToken } from '@/lib/customer';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';
import { OrderLineItems } from '@/components/orders/order-line-items';

type Order = {
  orderNumber: string;
  status: string;
  total: number;
  items: { name: string; description?: string | null; quantity: number }[];
};

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

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold">{uz.orderNumber(order.orderNumber)}</h1>
      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-card">
        <p className="text-2xl font-semibold text-brand-600">{statusLabel}</p>
        <p className="mt-2 text-sm text-zinc-500">{uz.liveUpdates}</p>
      </div>
      <div className="mt-6">
        <OrderLineItems items={order.items ?? []} />
      </div>
      <p className="mt-4 font-bold">
        {uz.total}: {formatSum(order.total)}
      </p>
    </main>
  );
}
