'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type DeliveryPricing = {
  baseDeliveryFee: number;
  perKmFee: number;
  maxDeliveryDistance: number;
  courierPricePerKm: number;
  courierMinFee: number;
};

export function useDeliveryPricing() {
  const token = getToken();
  const qc = useQueryClient();

  const pricing = useQuery({
    queryKey: ['delivery-pricing'],
    queryFn: () => api<DeliveryPricing>('/settings/delivery-pricing', { token: token ?? undefined }),
    enabled: !!token,
  });

  const save = useMutation({
    mutationFn: (body: Partial<DeliveryPricing>) =>
      api<DeliveryPricing>('/settings/delivery-pricing', {
        method: 'PUT',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['delivery-pricing'], data);
    },
  });

  return { pricing, save };
}

export type DeliveryQuote = {
  distanceKm: number;
  billableDistanceKm: number;
  deliveryFee: number;
  perKmFee: number;
  baseDeliveryFee: number;
  restaurantLatitude: number;
  restaurantLongitude: number;
  customerLatitude: number;
  customerLongitude: number;
};

export async function fetchDeliveryQuote(params: {
  restaurantId: string;
  latitude: number;
  longitude: number;
}) {
  return api<DeliveryQuote>('/orders/delivery-quote', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
