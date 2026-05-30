'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTrackingHistory } from '@/lib/customer';
import { uz } from '@/lib/uz';

export default function OrdersPage() {
  const [orders, setOrders] = useState<{ token: string; orderNumber?: string; savedAt: string }[]>([]);

  useEffect(() => {
    setOrders(getTrackingHistory());
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">{uz.ordersTitle}</h1>
      <p className="mt-1 text-sm text-zinc-500">{uz.ordersSubtitle}</p>

      {!orders.length ? (
        <p className="mt-8 text-center text-sm text-zinc-500">{uz.noOrders}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.token}>
              <Link
                href={`/track/${o.token}`}
                className="block rounded-xl border bg-white p-4 shadow-card"
              >
                <p className="font-medium">
                  {o.orderNumber ? `#${o.orderNumber}` : uz.order}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(o.savedAt).toLocaleString('uz-UZ')}
                </p>
                <p className="mt-1 text-sm text-brand-600">{uz.track} →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
