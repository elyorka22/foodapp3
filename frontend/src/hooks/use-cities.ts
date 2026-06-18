'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type City = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isDefault: boolean;
};

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => api<City[]>('/cities'),
    staleTime: 5 * 60 * 1000,
  });
}
