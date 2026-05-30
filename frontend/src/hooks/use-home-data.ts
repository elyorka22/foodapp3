'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

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
  createdAt?: string;
  avgPrepMinutes?: number;
  minOrderAmount?: string | number | null;
  categories?: HomeCategory[];
  branches?: { address?: string }[];
};

export type HomeBanner = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  placement?: 'HERO' | 'PROMO';
  restaurantId?: string | null;
  sortOrder?: number;
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
