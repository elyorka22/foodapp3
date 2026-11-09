'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  sortOrder?: number;
  isActive?: boolean;
  businessTypeId?: string | null;
};

export type StoreCategoryForm = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  sortOrder?: number;
  isActive?: boolean;
};

type Scope =
  | { businessTypeId: string; typeSlug?: never; businessId?: never }
  | { typeSlug: string; businessTypeId?: never; businessId?: never }
  | { businessId: string; businessTypeId?: never; typeSlug?: never };

function scopeQuery(scope: Scope): string {
  if ('businessTypeId' in scope && scope.businessTypeId) {
    return `businessTypeId=${encodeURIComponent(scope.businessTypeId)}`;
  }
  if ('typeSlug' in scope && scope.typeSlug) {
    return `type=${encodeURIComponent(scope.typeSlug)}`;
  }
  return `businessId=${encodeURIComponent(scope.businessId!)}`;
}

function scopeKey(scope: Scope): string {
  if ('businessTypeId' in scope && scope.businessTypeId) return `typeId:${scope.businessTypeId}`;
  if ('typeSlug' in scope && scope.typeSlug) return `type:${scope.typeSlug}`;
  return `biz:${scope.businessId}`;
}

/** Shared type-scoped store categories (preferred) or legacy business-scoped list. */
export function useAdminProductCategories(scope: Scope | undefined) {
  const token = getToken();
  const qc = useQueryClient();
  const enabled = !!token && !!scope;
  const queryKey = ['admin-product-categories', scope ? scopeKey(scope) : 'none'] as const;

  const list = useQuery({
    queryKey,
    queryFn: () =>
      api<StoreCategory[]>(
        `/categories?${scopeQuery(scope!)}&includeInactive=true`,
        { token: token ?? undefined },
      ),
    enabled,
  });

  const create = useMutation({
    mutationFn: (body: StoreCategoryForm) => {
      const payload: Record<string, unknown> = { ...body };
      if (scope && 'businessTypeId' in scope && scope.businessTypeId) {
        payload.businessTypeId = scope.businessTypeId;
      } else if (scope && 'typeSlug' in scope && scope.typeSlug) {
        payload.type = scope.typeSlug;
      } else if (scope && 'businessId' in scope && scope.businessId) {
        payload.businessId = scope.businessId;
      }
      return api('/categories', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<StoreCategoryForm> }) =>
      api(`/categories/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/categories/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return { list, create, update, remove };
}
