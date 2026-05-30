'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { ShoppingCart } from 'lucide-react';
import { RestaurantMenuHeader } from '@/components/restaurant/restaurant-menu-header';
import { ProductCard, type MenuProduct } from '@/components/restaurant/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { uz } from '@/lib/uz';
import { Package } from 'lucide-react';

type RestaurantDetail = {
  id: string;
  name: string;
  isOpen?: boolean;
  products: MenuProduct[];
};

export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const { data: restaurant, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => api<RestaurantDetail>(`/restaurants/${encodeURIComponent(slug)}`),
    enabled: Boolean(slug),
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: fallbackProducts } = useQuery({
    queryKey: ['restaurant-products', restaurant?.id],
    queryFn: () => api<MenuProduct[]>(`/products?restaurantId=${restaurant!.id}`),
    enabled: Boolean(restaurant?.id),
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg bg-[#F5F5F7] px-3 pb-24">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <main className="mx-auto max-w-lg p-4">
        <p className="text-zinc-500">{uz.restaurantNotFound}</p>
        {isError && (
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-brand-600"
            onClick={() => refetch()}
          >
            {uz.retry}
          </button>
        )}
      </main>
    );
  }

  const closed = restaurant.isOpen === false;
  const embedded = restaurant.products ?? [];
  const products = embedded.length > 0 ? embedded : (fallbackProducts ?? []);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-3 pb-24">
      <RestaurantMenuHeader title={restaurant.name} />

      {closed && (
        <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {uz.restaurantClosed}
        </p>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={uz.menuEmpty}
          description={uz.menuEmptyHint}
          className="mt-8"
        />
      ) : (
        <div className="grid grid-cols-3 gap-x-2 gap-y-4 pb-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              disabled={closed}
              onAdd={() =>
                addItem({
                  productId: p.id,
                  name: p.name,
                  price: Number(p.price),
                  restaurantId: restaurant.id,
                })
              }
            />
          ))}
        </div>
      )}

      {cartCount > 0 && (
        <button
          type="button"
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 mx-auto flex max-w-lg items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 text-base font-semibold text-white active:scale-[0.98]"
          onClick={() => router.push('/cart')}
        >
          <ShoppingCart size={20} /> {uz.cartFab(cartCount)}
        </button>
      )}
    </div>
  );
}
