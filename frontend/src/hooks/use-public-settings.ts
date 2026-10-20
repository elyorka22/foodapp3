'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { HomeServiceCards } from '@/lib/home-service-cards';

export type PublicSettings = {
  app_name: string;
  home_title: string;
  home_subtitle: string;
  home_restaurants_banner_image_url: string;
  home_restaurants_banner_title: string;
  social_instagram_url: string;
  social_youtube_url: string;
  partnership_phone: string;
  home_service_cards?: HomeServiceCards;
};

export function usePublicSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => api<PublicSettings>('/settings/public'),
    staleTime: 120_000,
  });
}
