'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type DeliveryZoneForm = {
  name: string;
  cityId?: string;
  businessId?: string;
  branchId?: string;
  centerLatitude?: number;
  centerLongitude?: number;
  radiusKm?: number;
  /** Raw GeoJSON text (Polygon / MultiPolygon) — optional alternative to circle */
  polygonJson?: string;
  baseFee: number;
  pricePerKm: number;
  minDeliveryFee: number;
  isActive?: boolean;
};

export type AdminDeliveryZone = DeliveryZoneForm & {
  id: string;
  city?: { id: string; name: string } | null;
  business?: { id: string; name: string } | null;
};

export function useAdminDeliveryZones(cityId?: string) {
  const token = getToken();
  const qc = useQueryClient();
  const key = ['admin-delivery-zones', cityId ?? 'all'] as const;

  const list = useQuery({
    queryKey: key,
    queryFn: () => {
      const q = cityId ? `?cityId=${encodeURIComponent(cityId)}` : '';
      return api<AdminDeliveryZone[]>(`/delivery-zones${q}`, {
        token: token ?? undefined,
      });
    },
    enabled: !!token,
  });

  const create = useMutation({
    mutationFn: (body: DeliveryZoneForm) =>
      api('/delivery-zones', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-delivery-zones'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DeliveryZoneForm> }) =>
      api(`/delivery-zones/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-delivery-zones'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/delivery-zones/${id}`, {
        method: 'DELETE',
        token: token ?? undefined,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-delivery-zones'] }),
  });

  return { list, create, update, remove };
}
