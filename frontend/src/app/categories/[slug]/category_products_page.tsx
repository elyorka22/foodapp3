'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryProducts, useDishCategories } from '@/hooks/use-dish-categories';
import { resolveImageUrl } from '@/lib/image-url';
import { MenuProductImage } from '@/components/restaurant/menu-product-image';
import { uz } from '@/lib/uz';

export default function CategoryProductsPage({ slug }: { slug: string }) {
  const categoriesQuery = useDishCategories();
  const productsQuery = useCategoryProducts(slug);

  const category = (categoriesQuery.data ?? []).find((c) => c.slug === slug);
  const products = productsQuery.data?.data ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-[#F5F5F7] px-4 pb-8">
      <div className="flex items-center gap-2 py-4">
        <Link href="/" className="rounded-full p-2 active:bg-zinc-200" aria-label="Orqaga">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold">{category?.name ?? slug}</h1>
      </div>

      {productsQuery.isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      )}

      {productsQuery.isError && (
        <EmptyState title={uz.productsLoadError} description={uz.checkConnection} />
      )}

      {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && (
        <EmptyState title="Mahsulot topilmadi" description="Bu kategoriyada hozircha taom yo‘q." />
      )}

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => {
          const img = resolveImageUrl(p.images?.[0]?.url);
          const restaurantSlug = p.business?.slug;
          return (
            <Link
              key={p.id}
              href={restaurantSlug ? `/restaurants/${restaurantSlug}` : '#'}
              className="overflow-hidden rounded-2xl bg-white shadow-card active:scale-[0.98]"
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-100">
                {img ? <MenuProductImage src={img} alt={p.name} /> : null}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{p.name}</p>
                {p.business?.name && (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{p.business.name}</p>
                )}
                {p.description?.trim() ? (
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.description}</p>
                ) : null}
                <p className="mt-1.5 text-sm font-bold text-brand-600">
                  {Number(p.price).toLocaleString('uz-UZ')} so‘m
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
