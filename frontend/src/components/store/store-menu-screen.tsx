'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Package, Search, ShoppingCart, X } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/image-url';
import { useCartStore } from '@/store/cart';
import { useHomeBanners } from '@/hooks/use-home-data';
import { BannerSlotCarousel } from '@/components/home/banner-slot-carousel';
import type { BusinessMenuDetail } from '@/components/business/business-menu-screen';
import type { MenuProduct } from '@/components/restaurant/product-card';
import { StoreCategoryCircles } from '@/components/store/store-category-circles';
import { StoreProductCard } from '@/components/store/store-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { uz } from '@/lib/uz';

type Props = {
  slug: string;
  backHref?: string;
};

function categoryIdOf(p: MenuProduct): string | null {
  return p.productCategoryId ?? p.productCategory?.id ?? null;
}

function ProductRow({
  title,
  products,
  storeId,
  storeName,
  disabled,
  href,
}: {
  title: string;
  products: MenuProduct[];
  storeId: string;
  storeName: string;
  disabled?: boolean;
  href?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-2 px-4">
        <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900">
          {title}
        </h2>
        {href ? (
          <Link href={href} className="text-zinc-400 active:opacity-70" aria-label={uz.seeAll}>
            <ChevronRight size={22} strokeWidth={2.25} />
          </Link>
        ) : null}
      </div>
      <div className="-mx-0 flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {products.map((p) => (
          <StoreProductCard
            key={p.id}
            product={p}
            restaurantId={storeId}
            restaurantName={storeName}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}

export function StoreMenuScreen({ slug, backHref = '/' }: Props) {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [query, setQuery] = useState('');

  const { data: business, isLoading, isError, refetch } = useQuery({
    queryKey: ['business-menu', slug],
    queryFn: () => api<BusinessMenuDetail>(`/restaurants/${encodeURIComponent(slug)}`),
    enabled: Boolean(slug),
    retry: 1,
    staleTime: 60_000,
  });

  const bannersQuery = useHomeBanners();

  const storeBanners = useMemo(() => {
    if (!business?.id) return [];
    return (bannersQuery.data ?? [])
      .filter((b) => b.restaurantId === business.id)
      .filter((b) => Boolean(resolveImageUrl(b.imageUrl)))
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [bannersQuery.data, business?.id]);

  const { data: fallbackProducts } = useQuery({
    queryKey: ['business-products', business?.id],
    queryFn: () => api<MenuProduct[]>(`/products?restaurantId=${business!.id}`),
    enabled: Boolean(business?.id),
    staleTime: 60_000,
  });

  const categories = business?.productCategories ?? [];
  const allProducts = useMemo(() => {
    const embedded = business?.products ?? [];
    return embedded.length > 0 ? embedded : (fallbackProducts ?? []);
  }, [business?.products, fallbackProducts]);

  const search = query.trim().toLowerCase();
  const searched = useMemo(() => {
    if (!search) return allProducts;
    return allProducts.filter((p) => p.name.toLowerCase().includes(search));
  }, [allProducts, search]);

  const discounted = useMemo(
    () =>
      searched.filter((p) => {
        const price = Number(p.price);
        const compare = p.comparePrice != null ? Number(p.comparePrice) : null;
        return compare != null && compare > price;
      }),
    [searched],
  );

  const sections = useMemo(() => {
    if (activeCategoryId !== 'all') {
      const cat = categories.find((c) => c.id === activeCategoryId);
      if (!cat) return [];
      return [
        {
          category: cat,
          products: searched.filter((p) => categoryIdOf(p) === cat.id),
        },
      ];
    }
    return categories
      .map((category) => ({
        category,
        products: searched.filter((p) => categoryIdOf(p) === category.id),
      }))
      .filter((s) => s.products.length > 0);
  }, [activeCategoryId, categories, searched]);

  const closed = business?.isOpen === false;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg bg-background px-4 pb-24 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-11 w-full rounded-2xl" />
        <Skeleton className="mt-3 h-10 w-full rounded-full" />
        <div className="mt-5 grid grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="mx-auto h-[4.25rem] w-[4.25rem] rounded-full" />
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

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+10px)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 truncate text-[22px] font-extrabold tracking-tight text-zinc-900">
            {business.name}
          </h1>
          <Link
            href={backHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 active:scale-95"
            aria-label={uz.back}
          >
            <X size={18} strokeWidth={2.25} />
          </Link>
        </div>

        <label className="mt-3 flex h-11 items-center gap-2 rounded-2xl bg-zinc-100 px-3">
          <Search size={18} className="shrink-0 text-zinc-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={uz.searchInStore(business.name)}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </label>

        <div className="mt-3 flex rounded-full bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setFulfillment('delivery')}
            className={clsx(
              'flex-1 rounded-full py-2 text-[13px] font-bold transition',
              fulfillment === 'delivery'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600',
            )}
          >
            {uz.deliveryLabel}
          </button>
          <button
            type="button"
            onClick={() => setFulfillment('pickup')}
            className={clsx(
              'flex-1 rounded-full py-2 text-[13px] font-bold transition',
              fulfillment === 'pickup'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600',
            )}
          >
            {uz.pickupLabel}
          </button>
        </div>

        {closed ? (
          <p className="mt-2 text-[13px] font-semibold text-red-500">
            {uz.deliveryTimeEnded}
          </p>
        ) : null}
      </header>

      <div className="px-4 pt-1">
        {categories.length > 0 ? (
          <StoreCategoryCircles
            categories={categories}
            activeId={activeCategoryId}
            onChange={setActiveCategoryId}
          />
        ) : null}
      </div>

      {storeBanners.length > 0 ? (
        <div className="mt-4 h-28 px-4">
          <BannerSlotCarousel banners={storeBanners} />
        </div>
      ) : null}

      {searched.length === 0 ? (
        <EmptyState
          icon={Package}
          title={uz.menuEmpty}
          description={uz.menuEmptyHint}
          className="mt-8 px-4"
        />
      ) : (
        <>
          {activeCategoryId === 'all' && discounted.length > 0 ? (
            <ProductRow
              title={uz.storeDiscountsForYou}
              products={discounted}
              storeId={business.id}
              storeName={business.name}
              disabled={closed}
            />
          ) : null}

          {sections.map((section) => (
            <ProductRow
              key={section.category.id}
              title={section.category.name}
              products={section.products}
              storeId={business.id}
              storeName={business.name}
              disabled={closed}
            />
          ))}

          {sections.length === 0 && discounted.length === 0 ? (
            <ProductRow
              title={uz.shopsTitle}
              products={searched}
              storeId={business.id}
              storeName={business.name}
              disabled={closed}
            />
          ) : null}
        </>
      )}

      {cartCount > 0 && (
        <button
          type="button"
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-30 flex -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-base font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] active:scale-[0.98]"
          onClick={() => router.push('/cart')}
        >
          <ShoppingCart size={20} /> {uz.cartFab(cartCount)}
        </button>
      )}
    </div>
  );
}
