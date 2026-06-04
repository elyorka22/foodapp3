'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { isCatalogMode } from '@/lib/business-catalog-mode';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, Package } from 'lucide-react';
import { RestaurantMenuHeader } from '@/components/restaurant/restaurant-menu-header';
import { RestaurantCategoryTabs } from '@/components/restaurant/restaurant-category-tabs';
import { ProductCard, type MenuProduct } from '@/components/restaurant/product-card';
import { BusinessContactProfile } from '@/components/business/business-contact-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { uz } from '@/lib/uz';

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

type RestaurantDetail = {
  id: string;
  name: string;
  isOpen?: boolean;
  catalogMode?: string;
  phone?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  productCategories?: ProductCategory[];
  products: MenuProduct[];
};

function productCategoryId(p: MenuProduct): string | null {
  return p.productCategoryId ?? p.dishCategoryId ?? null;
}

export default function RestaurantPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [activeCategoryId, setActiveCategoryId] = useState('all');

  const { data: restaurant, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => api<RestaurantDetail>(`/restaurants/${encodeURIComponent(slug)}`),
    enabled: Boolean(slug),
    retry: 1,
    staleTime: 60_000,
  });

  const catalog = isCatalogMode(restaurant?.catalogMode);

  const { data: fallbackProducts } = useQuery({
    queryKey: ['restaurant-products', restaurant?.id],
    queryFn: () => api<MenuProduct[]>(`/products?restaurantId=${restaurant!.id}`),
    enabled: Boolean(restaurant?.id) && catalog,
    staleTime: 60_000,
  });

  const categories = useMemo(
    () =>
      (restaurant?.productCategories ?? []).map((c) => ({
        id: c.id,
        name: c.name,
      })),
    [restaurant?.productCategories],
  );

  const allProducts = useMemo(() => {
    const embedded = restaurant?.products ?? [];
    return embedded.length > 0 ? embedded : (fallbackProducts ?? []);
  }, [restaurant?.products, fallbackProducts]);

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === 'all') return allProducts;
    return allProducts.filter((p) => productCategoryId(p) === activeCategoryId);
  }, [allProducts, activeCategoryId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg bg-[#F5F5F7] px-3 pb-24">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="mt-4 h-8 w-48 rounded-lg" />
        <Skeleton className="mt-6 h-8 w-full rounded-lg" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
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

  if (!catalog) {
    return (
      <div className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-3 pb-24">
        <RestaurantMenuHeader title={restaurant.name} />
        <BusinessContactProfile
          name={restaurant.name}
          description={restaurant.description}
          logoUrl={restaurant.logoUrl}
          coverUrl={restaurant.coverUrl}
          phone={restaurant.phone}
        />
      </div>
    );
  }

  const closed = restaurant.isOpen === false;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-3 pb-24">
      <RestaurantMenuHeader title={restaurant.name} />

      {closed && (
        <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {uz.restaurantClosed}
        </p>
      )}

      <RestaurantCategoryTabs
        categories={categories}
        activeId={activeCategoryId}
        onChange={setActiveCategoryId}
      />

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={uz.menuEmpty}
          description={uz.menuEmptyHint}
          className="mt-8"
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 pb-4">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              restaurantId={restaurant.id}
              disabled={closed}
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
