/**
 * Canonical merchant API client.
 * All apps (web, customer mobile, courier, driver) should use these paths.
 * Legacy /restaurants/* routes remain during migration.
 */
import { api } from '@/lib/api';

export type BusinessPublic = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  minOrderAmount?: number | null;
  deliveryMinutes: number;
  averageRating: number;
  reviewCount: number;
  businessType?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    catalogMode?: 'CATALOG' | 'CONTACT';
  } | null;
  category?: string | null;
};

export type BusinessType = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  catalogMode?: 'CATALOG' | 'CONTACT';
  sortOrder: number;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function fetchBusinessTypes() {
  return api<BusinessType[]>('/business-types');
}

export function fetchBusinesses(params?: URLSearchParams) {
  const q = params?.toString();
  return api<{ data: BusinessPublic[]; meta?: unknown }>(
    `/businesses${q ? `?${q}` : ''}`,
  );
}

export function fetchBusiness(idOrSlug: string) {
  return api<BusinessPublic & { products?: unknown[]; productCategories?: ProductCategory[] }>(
    `/businesses/${encodeURIComponent(idOrSlug)}`,
  );
}

/** Product menu categories for one merchant (NOT business vertical types). */
export function fetchProductCategories(businessId: string, token?: string) {
  return api<ProductCategory[]>(
    `/categories?businessId=${encodeURIComponent(businessId)}`,
    token ? { token } : undefined,
  );
}
