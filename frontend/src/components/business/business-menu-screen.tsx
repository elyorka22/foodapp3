'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { isRestaurantKind } from '@/lib/business-kind';
import { useCartStore } from '@/store/cart';
import { RestaurantMenuHeader } from '@/components/restaurant/restaurant-menu-header';
import { RestaurantCategoryTabs } from '@/components/restaurant/restaurant-category-tabs';
import { ProductCard, type MenuProduct } from '@/components/restaurant/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { uz } from '@/lib/uz';

type MenuCategory = { id: string; name: string; slug?: string };

export type BusinessMenuDetail = {
  id: string;
  name: string;
  kind?: string;
  isOpen?: boolean;
  closesAt?: string | null;
  closingSoon?: boolean;
  phone?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  commissionRate?: number;
  address?: string | null;
  productCategories?: MenuCategory[];
  products: MenuProduct[];
};

type Props = {
  slug: string;
  backHref?: string;
};

function productMenuCategoryId(
  p: MenuProduct,
  restaurant: boolean,
): string | null {
  if (restaurant) {
    return (p as MenuProduct & { dishCategoryId?: string }).dishCategoryId ?? null;
  }
  return (p as MenuProduct & { productCategoryId?: string }).productCategoryId ?? null;
}

export function BusinessMenuScreen({ slug, backHref = '/' }: Props) {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [activeCategoryId, setActiveCategoryId] = useState('all');

  const { data: business, isLoading, isError, refetch } = useQuery({
    queryKey: ['business-menu', slug],
    queryFn: () => api<BusinessMenuDetail>(`/restaurants/${encodeURIComponent(slug)}`),
    enabled: Boolean(slug),
    retry: 1,
    staleTime: 60_000,
  });

  const restaurant = isRestaurantKind(business?.kind);

  const { data: fallbackProducts } = useQuery({
    queryKey: ['business-products', business?.id],
    queryFn: () => api<MenuProduct[]>(`/products?restaurantId=${business!.id}`),
    enabled: Boolean(business?.id),
    staleTime: 60_000,
  });

  const categories: MenuCategory[] = useMemo(() => {
    if (!business) return [];
    return business.productCategories ?? [];
  }, [business]);

  const allProducts = useMemo(() => {
    const embedded = business?.products ?? [];
    return embedded.length > 0 ? embedded : (fallbackProducts ?? []);
  }, [business?.products, fallbackProducts]);

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === 'all') return allProducts;
    return allProducts.filter(
      (p) => productMenuCategoryId(p, restaurant) === activeCategoryId,
    );
  }, [allProducts, activeCategoryId, restaurant]);

  const menuSections = useMemo(() => {
    if (activeCategoryId !== 'all') return null;
    return categories
      .map((category) => ({
        category,
        products: allProducts.filter(
          (product) => productMenuCategoryId(product, restaurant) === category.id,
        ),
      }))
      .filter((section) => section.products.length > 0);
  }, [activeCategoryId, allProducts, categories, restaurant]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg bg-[#F5F5F7] px-3 pb-24">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="mt-6 h-8 w-48 rounded-lg" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
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

  const closed = business.isOpen === false;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-3 pb-24">
      <RestaurantMenuHeader
        title={business.name}
        backHref={backHref}
        isOpen={business.isOpen}
        closesAt={business.closesAt}
        closingSoon={business.closingSoon}
      />

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
      ) : menuSections ? (
        <div className="space-y-6 pb-4">
          {menuSections.map((section) => (
            <section key={section.category.id}>
              <h2 className="mb-3 text-base font-semibold text-zinc-900">
                {section.category.name}
              </h2>
              <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                {section.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    restaurantId={business.id}
                    restaurantName={business.name}
                    disabled={closed}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 pb-4">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              restaurantId={business.id}
              restaurantName={business.name}
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
