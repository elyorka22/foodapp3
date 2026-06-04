import { BusinessKind, Prisma } from '@prisma/client';
import { resolveBusinessKind } from '../../common/utils/business-kind.util';
import { BusinessPublicDto } from './business.types';

type BusinessWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  coverScale?: number;
  coverPositionX?: number;
  coverPositionY?: number;
  phone: string | null;
  minOrderAmount: Prisma.Decimal | null;
  avgPrepMinutes: number;
  averageRating: Prisma.Decimal | null;
  reviewCount: number;
  businessType?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    catalogMode?: string;
  } | null;
  branches?: { latitude: Prisma.Decimal; longitude: Prisma.Decimal }[];
};

export function toBusinessPublicDto(row: BusinessWithRelations): BusinessPublicDto {
  const branch = row.branches?.[0];
  return {
    id: row.id,
    kind: resolveBusinessKind(row),
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logoUrl,
    coverUrl: row.coverUrl,
    coverScale: row.coverScale ?? 100,
    coverPositionX: row.coverPositionX ?? 50,
    coverPositionY: row.coverPositionY ?? 50,
    phone: row.phone,
    minOrderAmount: row.minOrderAmount ? Number(row.minOrderAmount) : null,
    deliveryMinutes: row.avgPrepMinutes,
    averageRating: row.averageRating ? Number(row.averageRating) : 4.5,
    reviewCount: row.reviewCount,
    businessType: row.businessType ?? null,
    category: row.businessType?.name ?? null,
    latitude: branch ? Number(branch.latitude) : null,
    longitude: branch ? Number(branch.longitude) : null,
  };
}
