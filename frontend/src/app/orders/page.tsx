'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTrackingHistory } from '@/lib/customer';

export default function OrdersPage() {
  const [orders, setOrders] = useState<{ token: string; orderNumber?: string; savedAt: string }[]>([]);

  useEffect(() => {
    setOrders(getTrackingHistory());
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">My orders</h1>
      <p className="mt-1 text-sm opacity-70">Track orders placed from this device</p>

      {!orders.length ? (
        <p className="mt-8 text-center text-sm opacity-60">
          No orders yet. Place an order from any restaurant.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.token}>
              <Link
                href={`/track/${o.token}`}
                className="block rounded-xl border p-4 dark:border-white/10"
              >
                <p className="font-medium">{o.orderNumber ? `#${o.orderNumber}` : 'Order'}</p>
                <p className="text-xs opacity-60">{new Date(o.savedAt).toLocaleString()}</p>
                <p className="mt-1 text-sm text-brand-600">Track →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
