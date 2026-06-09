'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type AdminSettings = {
  app_name: string;
  home_title: string;
  home_subtitle: string;
  support_phone: string;
  support_telegram: string;
  social_instagram_url: string;
  social_telegram_url: string;
  social_youtube_url: string;
  support_email: string;
  min_order_amount: number;
  free_delivery_threshold: number;
  default_delivery_fee: number;
  commission_default: number;
  banner_default_image_scale: number;
  banner_default_image_position_x: number;
  banner_default_image_position_y: number;
  restaurant_card_default_image_scale: number;
  restaurant_card_default_cover_position_x: number;
  restaurant_card_default_cover_position_y: number;
};

export function useAdminSettings() {
  const token = getToken();
  const qc = useQueryClient();

  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<AdminSettings>('/settings/admin', { token: token ?? undefined }),
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: (body: Partial<AdminSettings>) =>
      api<AdminSettings>('/settings/admin', {
        method: 'PUT',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['admin-settings'], data);
    },
  });

  return { settings, save };
}
