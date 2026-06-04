'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ShopBusiness } from '@/hooks/use-shops-data';
import { filterStoreBusinesses } from '@/lib/business-kind';
import { unwrapList } from '@/lib/list-utils';
import { resolveImageUrl } from '@/lib/image-url';

export type HomeCategory = { id: string; name: string; slug: string };

export type HomeRestaurant = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  coverPositionX?: number;
  coverPositionY?: number;
  coverScale?: number;
  createdAt?: string;
  avgPrepMinutes?: number;
  deliveryMinutes?: number;
  averageRating?: number;
  reviewCount?: number;
  minOrderAmount?: string | number | null;
  categories?: HomeCategory[];
  productCategories?: HomeCategory[];
  branches?: { address?: string }[];
};

export type HomeBanner = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  placement?: 'HERO' | 'PROMO' | 'HOME_MAIN' | 'HOME_SIDE_TOP' | 'HOME_SIDE_BOTTOM';
  restaurantId?: string | null;
  sortOrder?: number;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
};

export function useHomeBanners() {
  return useQuery({
    queryKey: ['banners', 'active'],
    queryFn: () => api<HomeBanner[]>('/banners'),
    staleTime: 60_000,
    retry: 2,
  });
}

export function useHomeRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'home'],
    queryFn: () =>
      api<{ data: HomeRestaurant[]; meta?: { total: number } }>('/restaurants?limit=50'),
    staleTime: 30_000,
    retry: 2,
  });
}

/** Active marketplace stores for the home bottom-right slot (cover/logo carousel). */
export function useHomeFeaturedStores() {
  return useQuery({
    queryKey: ['shops-businesses', 'home-featured'],
    queryFn: async () => {
      const res = await api<{ data: ShopBusiness[]; meta?: unknown }>(
        '/businesses?limit=20&vertical=store',
      );
      return filterStoreBusinesses(unwrapList(res));
    },
    staleTime: 60_000,
    retry: 2,
  });
}
