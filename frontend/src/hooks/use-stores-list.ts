'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ShopBusiness } from '@/hooks/use-shops-data';
import { getSelectedCitySlug } from '@/lib/city-selection';
import { useSelectedCity } from '@/hooks/use-selected-city';

const TYPE_TITLES: Record<string, string> = {
  flowers: 'Gullar',
  perfume: 'Kosmetika',
  pharmacy: 'Dorixona',
  grocery: 'Mahsulotlar',
  gift: "Sovg'alar",
  electronics: 'Elektronika',
};

export function storeTypeTitle(type: string | null | undefined): string {
  if (!type) return 'Do‘konlar';
  return TYPE_TITLES[type] ?? type;
}

export function useStoresList(type?: string | null) {
  const { selectedCity, isLoading: cityLoading } = useSelectedCity();
  const citySlug = selectedCity?.slug ?? getSelectedCitySlug();
  const normalized = type?.trim() || undefined;

  return useQuery({
    queryKey: ['stores', 'list', citySlug, normalized ?? 'all'],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '40', vertical: 'store' });
      if (citySlug) params.set('city', citySlug);
      if (normalized) params.set('type', normalized);
      return api<{ data: ShopBusiness[]; meta?: { total: number } }>(
        `/businesses?${params.toString()}`,
      );
    },
    staleTime: 30_000,
    retry: 2,
    enabled: Boolean(citySlug) || !cityLoading,
  });
}
