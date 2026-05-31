'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { formatSum } from '@/lib/format-sum';
import { HomeTopBar } from '@/components/home/home-top-bar';
import { uz } from '@/lib/uz';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, total, clear } = useCartStore();

  if (!items.length) {
    return (
      <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
        <HomeTopBar />
        <div className="mt-8 text-center">
          <p className="text-lg font-medium">{uz.cartEmpty}</p>
          <Link href="/" className="mt-4 inline-block text-brand-600">
            {uz.browseRestaurants}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <HomeTopBar />
      <h1 className="mt-6 text-xl font-bold">{uz.cartTitle}</h1>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li
            key={i.productId}
            className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-card"
          >
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-sm text-zinc-500">
                {i.quantity} × {formatSum(i.price)}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-red-500"
              onClick={() => removeItem(i.productId)}
            >
              {uz.remove}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-lg font-bold">
        {uz.subtotal}: {formatSum(total())}
      </p>
      <div className="mt-4 flex gap-2">
        <Button type="button" variant="secondary" onClick={() => clear()}>
          {uz.clear}
        </Button>
        <Button type="button" size="lg" className="flex-1" onClick={() => router.push('/checkout')}>
          {uz.checkout}
        </Button>
      </div>
    </main>
  );
}
