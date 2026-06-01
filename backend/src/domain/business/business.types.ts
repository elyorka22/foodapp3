import { BusinessApprovalStatus } from '@prisma/client';

/** Domain entity for any merchant (restaurant, grocery, flower shop, …). */
export type BusinessEntity = {
  id: string;
  businessTypeId: string | null;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  approvalStatus: BusinessApprovalStatus;
  minOrderAmount: number | null;
  avgPrepMinutes: number;
  averageRating: number;
  reviewCount: number;
};

/** Public API shape — stable for web + mobile clients. */
export type BusinessPublicDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  minOrderAmount: number | null;
  deliveryMinutes: number;
  averageRating: number;
  reviewCount: number;
  businessType: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
};
