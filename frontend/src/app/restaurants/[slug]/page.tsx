'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { ShoppingCart } from 'lucide-react';
import { formatSum } from '@/lib/format-sum';
import { uz } from '@/lib/uz';

type Product = {
  id: string;
  name: string;
  price: string | number;
  description?: string;
  restaurantId: string;
};

export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () =>
      api<{ id: string; name: string; isOpen?: boolean; products: Product[] }>(
        `/restaurants/${slug}`,
      ),
  });

  if (isLoading) return <p className="p-4 text-zinc-500">{uz.loading}</p>;
  if (!restaurant) return <p className="p-4 text-zinc-500">{uz.restaurantNotFound}</p>;

  return (
    <main className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <Link href="/" className="text-sm text-brand-600">
        ← {uz.back}
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{restaurant.name}</h1>
      {restaurant.isOpen === false && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {uz.restaurantClosed}
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {restaurant.products?.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-card"
          >
            <div className="pr-3">
              <h3 className="font-medium">{p.name}</h3>
              {p.description && (
                <p className="line-clamp-2 text-xs text-zinc-500">{p.description}</p>
              )}
              <p className="mt-1 font-semibold text-brand-600">{formatSum(p.price)}</p>
            </div>
            <button
              type="button"
              disabled={restaurant.isOpen === false}
              className="shrink-0 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              onClick={() =>
                addItem({
                  productId: p.id,
                  name: p.name,
                  price: Number(p.price),
                  restaurantId: restaurant.id,
                })
              }
            >
              {uz.addToCart}
            </button>
          </li>
        ))}
      </ul>

      {cartCount > 0 && (
        <button
          type="button"
          className="fixed bottom-20 left-4 right-4 mx-auto flex max-w-lg items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 font-semibold text-white shadow-lg"
          onClick={() => router.push('/cart')}
        >
          <ShoppingCart size={20} /> {uz.cartFab(cartCount)}
        </button>
      )}
    </main>
  );
}
