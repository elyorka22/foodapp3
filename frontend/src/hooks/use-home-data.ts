'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ShopBusiness } from '@/hooks/use-shops-data';
import { filterStoreBusinesses } from '@/lib/business-kind';
import { unwrapList } from '@/lib/list-utils';
import { getSelectedCitySlug } from '@/lib/city-selection';
import { useSelectedCity } from '@/hooks/use-selected-city';

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
  isOpen?: boolean;
  closesAt?: string | null;
  closingSoon?: boolean;
  minutesUntilClose?: number | null;
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
  const { selectedCity, isLoading: cityLoading } = useSelectedCity();
  const citySlug = selectedCity?.slug ?? getSelectedCitySlug();
  return useQuery({
    queryKey: ['restaurants', 'home', citySlug],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '12', vertical: 'restaurant' });
      if (citySlug) params.set('city', citySlug);
      return api<{ data: HomeRestaurant[]; meta?: { total: number } }>(
        `/businesses?${params.toString()}`,
      );
    },
    staleTime: 30_000,
    retry: 2,
    // Start as soon as we know a city (localStorage or /cities), not after both
    enabled: Boolean(citySlug) || !cityLoading,
  });
}

/** Active marketplace stores for the home bottom-right slot (cover/logo carousel). */
export function useHomeFeaturedStores() {
  const { selectedCity, isLoading: cityLoading } = useSelectedCity();
  const citySlug = selectedCity?.slug ?? getSelectedCitySlug();
  return useQuery({
    queryKey: ['shops-businesses', 'home-featured', citySlug],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '12', vertical: 'store' });
      if (citySlug) params.set('city', citySlug);
      const res = await api<{ data: ShopBusiness[]; meta?: unknown }>(
        `/businesses?${params.toString()}`,
      );
      return filterStoreBusinesses(unwrapList(res));
    },
    staleTime: 60_000,
    retry: 2,
    enabled: Boolean(citySlug) || !cityLoading,
  });
}
