'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Waiting for restaurant',
  ACCEPTED: 'Order accepted',
  PREPARING: 'Preparing your food',
  COURIER_ASSIGNED: 'Courier assigned',
  PICKED_UP: 'Picked up',
  DELIVERING: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

type Order = {
  orderNumber: string;
  status: string;
  total: number;
  items: { name: string; quantity: number }[];
};

export default function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let socket: Socket | null = null;

    api<Order>(`/orders/track/${token}`)
      .then(setOrder)
      .catch(() => setError('Order not found'));

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';
    socket = io(`${wsUrl}/orders`, { transports: ['websocket', 'polling'] });
    socket.emit('joinOrder', token);
    socket.on('orderUpdated', (payload: Order) => setOrder(payload));

    return () => {
      socket?.disconnect();
    };
  }, [token]);

  if (error) return <main className="p-4 text-red-500">{error}</main>;
  if (!order) return <main className="p-4">Loading order...</main>;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
      <div className="mt-6 rounded-xl border p-6 dark:border-white/10">
        <p className="text-2xl font-semibold text-brand-600">
          {STATUS_LABELS[order.status] ?? order.status}
        </p>
        <p className="mt-2 text-sm opacity-70">Live updates enabled</p>
      </div>
      <ul className="mt-6 space-y-2">
        {order.items?.map((i, idx) => (
          <li key={idx} className="flex justify-between text-sm">
            <span>
              {i.name} × {i.quantity}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-bold">Total: {Number(order.total).toLocaleString()} UZS</p>
    </main>
  );
}
