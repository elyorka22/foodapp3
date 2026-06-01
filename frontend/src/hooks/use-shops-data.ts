'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BusinessType as ApiBusinessType, BusinessPublic } from '@/lib/api/business';
import { unwrapList } from '@/lib/list-utils';

export type BusinessType = ApiBusinessType;

export type ShopBusiness = BusinessPublic;

export type ShopsFilter = 'popular' | 'nearest' | 'rating' | 'fastest';

export function useBusinessTypes() {
  return useQuery({
    queryKey: ['business-types'],
    queryFn: () => api<BusinessType[]>('/business-types'),
  });
}

export function useShops(params: {
  search?: string;
  type?: string;
  sort?: ShopsFilter;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  sp.set('limit', String(params.limit ?? 50));
  sp.set('page', String(params.page ?? 1));
  if (params.search?.trim()) sp.set('search', params.search.trim());
  if (params.type) sp.set('type', params.type);
  else sp.set('excludeType', 'restaurant');
  if (params.sort) sp.set('sort', params.sort);

  return useQuery({
    queryKey: ['shops-businesses', params],
    queryFn: async () => {
      const res = await api<{ data: ShopBusiness[]; meta?: unknown }>(
        `/businesses?${sp.toString()}`,
      );
      return { data: unwrapList(res), meta: res.meta };
    },
  });
}
