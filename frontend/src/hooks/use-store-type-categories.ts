'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type StoreTypeCategory = {
  key: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  id: string;
};

type CategoryPayload = {
  id: string;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
};

/** Shared product categories for one marketplace type (flowers, grocery, …). */
export function useStoreTypeCategories(typeSlug: string | undefined) {
  const list = useQuery({
    queryKey: ['store-type-categories', typeSlug] as const,
    queryFn: () =>
      api<CategoryPayload[]>(
        `/categories?type=${encodeURIComponent(typeSlug!)}`,
      ),
    enabled: Boolean(typeSlug),
    staleTime: 60_000,
    retry: 1,
  });

  const categories: StoreTypeCategory[] = [];
  for (const cat of list.data ?? []) {
    const name = cat.name?.trim();
    if (!name) continue;
    const slug = (cat.slug ?? cat.id).trim();
    categories.push({
      id: cat.id,
      key: slug.toLowerCase() || name.toLowerCase(),
      name,
      slug,
      imageUrl: cat.imageUrl ?? null,
    });
  }

  return {
    categories,
    isLoading: Boolean(typeSlug) && list.isLoading,
  };
}
