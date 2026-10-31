'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBusinessTypes, type BusinessType } from '@/lib/api/business';

export type { BusinessType };

export function useBusinessTypes() {
  return useQuery({
    queryKey: ['business-types'],
    queryFn: fetchBusinessTypes,
    staleTime: 60_000,
  });
}

/** Marketplace store types (excludes restaurant). */
export function useStoreBusinessTypes() {
  const query = useBusinessTypes();
  const types = (query.data ?? []).filter(
    (t) => (t.slug ?? '').toLowerCase() !== 'restaurant',
  );
  return { ...query, data: types };
}
