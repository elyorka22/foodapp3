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

  const categories: StoreTypeCategory[] = (list.data ?? [])
    .map((cat) => {
      const name = cat.name?.trim();
      if (!name) return null;
      const slug = (cat.slug ?? cat.id).trim();
      return {
        id: cat.id,
        key: slug.toLowerCase() || name.toLowerCase(),
        name,
        slug,
        imageUrl: cat.imageUrl ?? null,
      };
    })
    .filter((c): c is StoreTypeCategory => c != null);

  return {
    categories,
    isLoading: Boolean(typeSlug) && list.isLoading,
  };
}
