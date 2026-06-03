'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type DishCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  sortOrder?: number;
  _count?: { products: number };
};

export type CategoryProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  images?: { url: string; isPrimary?: boolean }[];
  business?: { id: string; name: string; slug: string; logoUrl?: string | null };
  dishCategory?: DishCategory | null;
};

export function useDishCategories() {
  return useQuery({
    queryKey: ['dish-categories'],
    queryFn: () => api<DishCategory[]>('/dish-categories'),
    staleTime: 60_000,
  });
}

export function useCategoryProducts(slug: string, page = 1) {
  return useQuery({
    queryKey: ['category-products', slug, page],
    queryFn: () =>
      api<{ data: CategoryProduct[]; meta: { total: number; page: number; totalPages: number } }>(
        `/products?categorySlug=${encodeURIComponent(slug)}&page=${page}&limit=24`,
      ),
    enabled: !!slug,
  });
}
