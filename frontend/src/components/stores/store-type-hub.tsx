'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Search, Store } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreHubShopCard } from '@/components/stores/store-hub-shop-card';
import { useStoresList, storeTypeTitle } from '@/hooks/use-stores-list';
import { useStoreTypeCategories } from '@/hooks/use-store-type-categories';
import { categoryImageStyle } from '@/lib/category-image-style';
import { resolveImageUrl } from '@/lib/image-url';
import { shopPublicPath } from '@/lib/shop-url';
import { uz } from '@/lib/uz';

type Props = {
  type: string;
};

export function StoreTypeHub({ type }: Props) {
  const title = storeTypeTitle(type);
  const storesQuery = useStoresList(type);
  const stores = storesQuery.data?.data ?? [];
  const { categories, isLoading: catsLoading } = useStoreTypeCategories(stores);

  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filteredStores = useMemo(() => {
    if (!q) return stores;
    return stores.filter((s) => s.name.toLowerCase().includes(q));
  }, [stores, q]);

  const filteredCategories = useMemo(() => {
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, q]);

  const listHref = `/stores?type=${encodeURIComponent(type)}`;

  return (
    <main className="customer-page mx-auto min-h-screen max-w-lg bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+8px)] backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          <Link
            href="/"
            className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full active:bg-zinc-100"
            aria-label={uz.back}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </Link>
          <h1 className="text-[20px] font-extrabold tracking-tight text-zinc-900">{title}</h1>
        </div>
      </header>

      {/* Shops carousel */}
      <section className="mt-1 px-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[17px] font-extrabold tracking-tight text-zinc-900">
            {uz.allStores}
          </h2>
          <Link
            href={listHref}
            className="flex items-center text-zinc-400 active:opacity-70"
            aria-label={uz.seeAll}
          >
            <ChevronRight size={22} strokeWidth={2.25} />
          </Link>
        </div>

        {storesQuery.isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[4.75rem] shrink-0 space-y-1.5">
                <Skeleton className="aspect-square w-full rounded-[18px] shadow-none" />
                <Skeleton className="mx-auto h-3 w-12 shadow-none" />
              </div>
            ))}
          </div>
        ) : storesQuery.isError ? (
          <EmptyState
            icon={Store}
            title={uz.storesLoadError}
            description={
              storesQuery.error instanceof Error
                ? storesQuery.error.message
                : uz.checkConnection
            }
            action={
              <Button type="button" size="sm" onClick={() => storesQuery.refetch()}>
                {uz.retry}
              </Button>
            }
          />
        ) : filteredStores.length === 0 ? (
          <p className="py-2 text-[13px] font-medium text-zinc-500">{uz.storesComingSoon}</p>
        ) : (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {filteredStores.map((store, i) => (
              <StoreHubShopCard key={store.id} store={store} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Search */}
      <div className="mt-4 px-4">
        <label className="flex h-12 items-center gap-2.5 rounded-full bg-zinc-100 px-4">
          <Search size={18} className="shrink-0 text-zinc-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={uz.searchInShops}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-zinc-400"
          />
        </label>
      </div>

      {/* Category grid */}
      <section className="mt-4 grid grid-cols-3 gap-2.5 px-4">
        <Link
          href={listHref}
          className="relative aspect-[1/1.05] overflow-hidden rounded-[18px] bg-zinc-100 active:scale-[0.98]"
        >
          <p className="relative z-10 p-2.5 text-[13px] font-bold leading-snug text-zinc-900">
            {uz.allCategoryProducts}
          </p>
          <span className="pointer-events-none absolute -bottom-1 -right-1 h-[70%] w-[70%] rounded-tl-[28px] bg-gradient-to-br from-pink-200/80 to-fuchsia-300/60" />
        </Link>

        {catsLoading
          ? [1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-[1/1.05] rounded-[18px] shadow-none" />
            ))
          : null}

        {!catsLoading &&
          filteredCategories.map((cat) => {
            const img = resolveImageUrl(cat.imageUrl);
            const framing = categoryImageStyle({ imageScale: 110 });
            return (
              <Link
                key={cat.key}
                href={shopPublicPath({ id: cat.storeSlug, slug: cat.storeSlug })}
                className="relative aspect-[1/1.05] overflow-hidden rounded-[18px] bg-zinc-100 active:scale-[0.98]"
              >
                <p className="relative z-10 line-clamp-3 p-2.5 pr-8 text-[13px] font-bold leading-snug text-zinc-900">
                  {cat.name}
                </p>
                {img ? (
                  <div
                    className="pointer-events-none absolute -bottom-2 -right-2 h-[72%] w-[72%]"
                    style={{ transform: framing.transform, transformOrigin: framing.transformOrigin }}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-contain object-bottom"
                        sizes="120px"
                      />
                    </div>
                  </div>
                ) : (
                  <span
                    className={clsx(
                      'pointer-events-none absolute -bottom-1 -right-1 flex h-[55%] w-[55%] items-center justify-center rounded-tl-[24px] text-2xl font-black text-zinc-300',
                      'bg-zinc-200/80',
                    )}
                  >
                    {cat.name.charAt(0)}
                  </span>
                )}
              </Link>
            );
          })}
      </section>
    </main>
  );
}
