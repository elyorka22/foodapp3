'use client';

import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ShopBusiness } from '@/hooks/use-shops-data';

export type StoreTypeCategory = {
  key: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  storeSlug: string;
};

type MenuPayload = {
  slug?: string;
  productCategories?: {
    id: string;
    name: string;
    slug?: string | null;
    imageUrl?: string | null;
  }[];
  products?: {
    name?: string;
    images?: { url: string; isPrimary?: boolean }[];
    productCategoryId?: string | null;
    productCategory?: { id?: string; name?: string; slug?: string | null } | null;
  }[];
};

/** Aggregate product categories across stores of one vertical (e.g. flowers). */
export function useStoreTypeCategories(stores: ShopBusiness[]) {
  const sample = stores.slice(0, 8);

  const queries = useQueries({
    queries: sample.map((store) => ({
      queryKey: ['business-menu', 'hub-cats', store.slug] as const,
      queryFn: () =>
        api<MenuPayload>(`/restaurants/${encodeURIComponent(store.slug)}`),
      enabled: Boolean(store.slug),
      staleTime: 60_000,
      retry: 1,
    })),
  });

  const isLoading = sample.length > 0 && queries.some((q) => q.isLoading);
  const byKey = new Map<string, StoreTypeCategory>();

  queries.forEach((q, i) => {
    const store = sample[i];
    if (!store || !q.data) return;
    const cats = q.data.productCategories ?? [];
    const products = q.data.products ?? [];

    for (const cat of cats) {
      const name = cat.name?.trim();
      if (!name) continue;
      const slug = (cat.slug ?? cat.id).trim();
      const key = slug.toLowerCase() || name.toLowerCase();
      if (byKey.has(key)) continue;

      let imageUrl = cat.imageUrl ?? null;
      if (!imageUrl) {
        const hit = products.find((p) => {
          const id = p.productCategoryId ?? p.productCategory?.id;
          return id === cat.id;
        });
        imageUrl = hit?.images?.find((im) => im.isPrimary)?.url ?? hit?.images?.[0]?.url ?? null;
      }

      byKey.set(key, {
        key,
        name,
        slug,
        imageUrl,
        storeSlug: store.slug,
      });
    }
  });

  return {
    categories: Array.from(byKey.values()),
    isLoading,
  };
}
