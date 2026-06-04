'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type PublicSettings = {
  app_name: string;
  home_title: string;
  home_subtitle: string;
};

export function usePublicSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => api<PublicSettings>('/settings/public'),
    staleTime: 120_000,
  });
}
