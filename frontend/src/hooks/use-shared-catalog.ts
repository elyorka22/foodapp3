'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type SharedProductForm = {
  type?: string;
  businessTypeId?: string;
  productCategoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  defaultPrice?: number;
  price?: number;
  comparePrice?: number;
  isAvailable?: boolean;
  sortOrder?: number;
};

export type OfferUpdate = {
  price?: number | null;
  comparePrice?: number | null;
  isAvailable?: boolean;
  isListed?: boolean;
};

export function useSharedCatalog(typeSlug: string) {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['shared-catalog', typeSlug],
    queryFn: () =>
      api<{ data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/products/shared?type=${encodeURIComponent(typeSlug)}&limit=100`,
        { token: token ?? undefined },
      ),
    enabled: !!token && !!typeSlug,
  });

  const create = useMutation({
    mutationFn: (body: SharedProductForm) =>
      api('/products/shared', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ ...body, type: typeSlug }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shared-catalog', typeSlug] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<SharedProductForm> }) =>
      api(`/products/shared/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shared-catalog', typeSlug] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/products/shared/${id}`, {
        method: 'DELETE',
        token: token ?? undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shared-catalog', typeSlug] }),
  });

  const addImage = useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      api(`/products/${id}/image`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ url }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shared-catalog', typeSlug] }),
  });

  return { list, create, update, remove, addImage };
}

export function useStoreCatalogOffers(businessId: string | undefined) {
  const token = getToken();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ['store-catalog-offers', businessId],
    queryFn: () =>
      api<any[]>(`/products/offers?businessId=${businessId}`, {
        token: token ?? undefined,
      }),
    enabled: !!token && !!businessId,
  });

  const enroll = useMutation({
    mutationFn: () =>
      api<{ created: number; skipped: number; catalogSize: number }>(
        '/products/enroll-catalog',
        {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify({ businessId }),
        },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['store-catalog-offers', businessId] });
      void qc.invalidateQueries({ queryKey: ['admin-products'] });
      void qc.invalidateQueries({ queryKey: ['business-products', businessId] });
    },
  });

  const updateOffer = useMutation({
    mutationFn: ({ id, body }: { id: string; body: OfferUpdate }) =>
      api(`/products/offers/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['store-catalog-offers', businessId] }),
  });

  return { list, enroll, updateOffer };
}
