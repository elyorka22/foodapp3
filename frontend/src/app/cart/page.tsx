'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, total, clear } = useCartStore();

  if (!items.length) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8 text-center">
        <p className="text-lg font-medium">Cart is empty</p>
        <Link href="/" className="mt-4 inline-block text-brand-600">
          Browse restaurants
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">Cart</h1>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li
            key={i.productId}
            className="flex items-center justify-between rounded-xl border p-4 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-sm opacity-70">
                {i.quantity} × {i.price.toLocaleString()} UZS
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-red-500"
              onClick={() => removeItem(i.productId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-lg font-bold">Subtotal: {total().toLocaleString()} UZS</p>
      <div className="mt-4 flex gap-2">
        <Button type="button" variant="secondary" onClick={() => clear()}>
          Clear
        </Button>
        <Button type="button" size="lg" className="flex-1" onClick={() => router.push('/checkout')}>
          Checkout
        </Button>
      </div>
    </main>
  );
}
