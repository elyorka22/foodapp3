'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { ShoppingCart } from 'lucide-react';

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
      api<{ id: string; name: string; products: Product[] }>(`/restaurants/${slug}`),
  });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (!restaurant) return <p className="p-4">Restaurant not found</p>;

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <Link href="/" className="text-sm text-brand-600">
        ← Back
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{restaurant.name}</h1>

      <ul className="mt-6 space-y-3">
        {restaurant.products?.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-xl border p-4 dark:border-white/10"
          >
            <div className="pr-3">
              <h3 className="font-medium">{p.name}</h3>
              {p.description && (
                <p className="text-xs opacity-60 line-clamp-2">{p.description}</p>
              )}
              <p className="mt-1 font-semibold text-brand-600">
                {Number(p.price).toLocaleString()} UZS
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white"
              onClick={() =>
                addItem({
                  productId: p.id,
                  name: p.name,
                  price: Number(p.price),
                  restaurantId: restaurant.id,
                })
              }
            >
              Add
            </button>
          </li>
        ))}
      </ul>

      {cartCount > 0 && (
        <button
          type="button"
          className="fixed bottom-6 left-4 right-4 mx-auto flex max-w-lg items-center justify-center gap-2 rounded-xl bg-brand-600 py-4 font-semibold text-white shadow-lg"
          onClick={() => router.push('/checkout')}
        >
          <ShoppingCart size={20} /> Cart ({cartCount})
        </button>
      )}
    </main>
  );
}
