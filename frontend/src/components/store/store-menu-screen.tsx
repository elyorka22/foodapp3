'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Package, Search, ShoppingCart, X } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { resolveImageUrl } from '@/lib/image-url';
import { useCartStore } from '@/store/cart';
import { useHomeBanners } from '@/hooks/use-home-data';
import { BannerSlotCarousel } from '@/components/home/banner-slot-carousel';
import type { BusinessMenuDetail } from '@/components/business/business-menu-screen';
import type { MenuProduct } from '@/components/restaurant/product-card';
import { StoreCategoryTiles } from '@/components/store/store-category-tiles';
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

function productThumb(p: MenuProduct): string | null {
  const primary = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];
  return resolveImageUrl(primary?.url);
}

function ProductRow({
  title,
  products,
  storeId,
  storeName,
  disabled,
}: {
  title: string;
  products: MenuProduct[];
  storeId: string;
  storeName: string;
  disabled?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mt-5">
      <div className="mb-3 px-4">
        <h2 className="text-[18px] font-extrabold tracking-tight text-zinc-900">
          {title}
        </h2>
      </div>
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
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
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
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
  const isSearching = search.length > 0;
  const showCatalog = !isSearching && activeCategoryId == null;

  const categoryTiles = useMemo(
    () =>
      categories.map((cat) => {
        const sample = allProducts.find((p) => categoryIdOf(p) === cat.id);
        return {
          id: cat.id,
          name: cat.name,
          imageUrl: sample ? productThumb(sample) : null,
        };
      }),
    [categories, allProducts],
  );

  /** Split categories into two visual groups for Magnit-like sections. */
  const mid = Math.ceil(categoryTiles.length / 2) || 0;
  const groupA = categoryTiles.slice(0, mid);
  const groupB = categoryTiles.slice(mid);

  const searched = useMemo(() => {
    if (!search) return allProducts;
    return allProducts.filter((p) => p.name.toLowerCase().includes(search));
  }, [allProducts, search]);

  const discounted = useMemo(
    () =>
      allProducts.filter((p) => {
        const price = Number(p.price);
        const compare = p.comparePrice != null ? Number(p.comparePrice) : null;
        return compare != null && compare > price;
      }),
    [allProducts],
  );

  const activeProducts = useMemo(() => {
    if (isSearching) return searched;
    if (activeCategoryId === 'all') return allProducts;
    if (activeCategoryId) {
      return allProducts.filter((p) => categoryIdOf(p) === activeCategoryId);
    }
    return [];
  }, [isSearching, searched, activeCategoryId, allProducts]);

  const activeTitle =
    activeCategoryId === 'all'
      ? uz.storeAllCategories
      : categories.find((c) => c.id === activeCategoryId)?.name ?? uz.shopsTitle;

  const closed = business?.isOpen === false;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg bg-background px-4 pb-24 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-11 w-full rounded-2xl" />
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[5/4] rounded-[16px]" />
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
          {activeCategoryId != null && !isSearching ? (
            <button
              type="button"
              onClick={() => setActiveCategoryId(null)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 active:scale-95"
              aria-label={uz.back}
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </button>
          ) : null}
          <h1 className="min-w-0 flex-1 truncate text-[22px] font-extrabold tracking-tight text-zinc-900">
            {activeCategoryId != null && !isSearching ? activeTitle : business.name}
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
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) setActiveCategoryId(null);
            }}
            placeholder={uz.searchInStore(business.name)}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </label>

        {showCatalog ? (
          <>
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
          </>
        ) : null}
      </header>

      {showCatalog ? (
        <>
          {discounted.length > 0 ? (
            <div className="mt-2 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
              {[
                { id: 'deals', label: uz.storeDiscountsForYou, emoji: '%' },
                ...categories.slice(0, 3).map((c) => ({
                  id: c.id,
                  label: c.name,
                  emoji: c.name.trim().charAt(0).toUpperCase(),
                })),
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() =>
                    setActiveCategoryId(chip.id === 'deals' ? 'all' : chip.id)
                  }
                  className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 active:scale-[0.97]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-lg font-black text-zinc-700">
                    {chip.emoji}
                  </span>
                  <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-zinc-700">
                    {chip.label}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {storeBanners.length > 0 ? (
            <div className="mt-4 h-[7.5rem] px-4">
              <BannerSlotCarousel banners={storeBanners} />
            </div>
          ) : null}

          {groupA.length > 0 ? (
            <StoreCategoryTiles
              title={business.name}
              categories={groupA}
              onSelect={setActiveCategoryId}
              tone="peach"
              showAllTile={groupB.length === 0}
            />
          ) : null}

          {groupB.length > 0 ? (
            <StoreCategoryTiles
              title={uz.shopsTitle}
              categories={groupB}
              onSelect={setActiveCategoryId}
              tone="mint"
              showAllTile
            />
          ) : null}

          {categories.length === 0 && allProducts.length > 0 ? (
            <ProductRow
              title={uz.shopsTitle}
              products={allProducts}
              storeId={business.id}
              storeName={business.name}
              disabled={closed}
            />
          ) : null}

          {categories.length === 0 && allProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title={uz.menuEmpty}
              description={uz.menuEmptyHint}
              className="mt-8 px-4"
            />
          ) : null}
        </>
      ) : activeProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={uz.menuEmpty}
          description={uz.menuEmptyHint}
          className="mt-8 px-4"
        />
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-4 px-4 pb-4">
          {activeProducts.map((p) => (
            <StoreProductCard
              key={p.id}
              product={p}
              restaurantId={business.id}
              restaurantName={business.name}
              disabled={closed}
              className="w-full"
            />
          ))}
        </div>
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
