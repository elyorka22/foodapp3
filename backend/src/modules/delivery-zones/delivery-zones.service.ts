import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { distanceKm, pointInGeoJson } from '../../common/utils/geo.util';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { CheckDeliveryZoneQueryDto } from './dto/check-delivery-zone.query.dto';

@Injectable()
export class DeliveryZonesService {
  constructor(private prisma: PrismaService) {}

  listAdmin(filters?: { cityId?: string; businessId?: string }) {
    return this.prisma.deliveryZone.findMany({
      where: {
        deletedAt: null,
        ...(filters?.cityId ? { cityId: filters.cityId } : {}),
        ...(filters?.businessId ? { businessId: filters.businessId } : {}),
      },
      include: {
        city: { select: { id: true, name: true, slug: true } },
        business: { select: { id: true, name: true, slug: true } },
        branch: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateDeliveryZoneDto) {
    this.assertGeometry(dto);
    await this.validateRefs(dto);
    return this.prisma.deliveryZone.create({
      data: {
        name: dto.name.trim(),
        cityId: dto.cityId,
        businessId: dto.businessId,
        branchId: dto.branchId,
        centerLatitude: dto.centerLatitude,
        centerLongitude: dto.centerLongitude,
        radiusKm: dto.radiusKm,
        polygon: dto.polygon as Prisma.InputJsonValue | undefined,
        baseFee: dto.baseFee,
        pricePerKm: dto.pricePerKm,
        minDeliveryFee: dto.minDeliveryFee,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateDeliveryZoneDto) {
    await this.ensure(id);
    if (
      dto.radiusKm !== undefined ||
      dto.polygon !== undefined ||
      dto.centerLatitude !== undefined
    ) {
      const existing = await this.prisma.deliveryZone.findFirst({
        where: { id, deletedAt: null },
      });
      this.assertGeometry({
        radiusKm: dto.radiusKm ?? (existing?.radiusKm != null ? Number(existing.radiusKm) : undefined),
        centerLatitude:
          dto.centerLatitude ??
          (existing?.centerLatitude != null ? Number(existing.centerLatitude) : undefined),
        centerLongitude:
          dto.centerLongitude ??
          (existing?.centerLongitude != null ? Number(existing.centerLongitude) : undefined),
        polygon: (dto.polygon ?? existing?.polygon) as CreateDeliveryZoneDto['polygon'],
      });
    }
    await this.validateRefs(dto);
    return this.prisma.deliveryZone.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.cityId !== undefined && { cityId: dto.cityId }),
        ...(dto.businessId !== undefined && { businessId: dto.businessId }),
        ...(dto.branchId !== undefined && { branchId: dto.branchId }),
        ...(dto.centerLatitude !== undefined && { centerLatitude: dto.centerLatitude }),
        ...(dto.centerLongitude !== undefined && { centerLongitude: dto.centerLongitude }),
        ...(dto.radiusKm !== undefined && { radiusKm: dto.radiusKm }),
        ...(dto.polygon !== undefined && {
          polygon: dto.polygon as Prisma.InputJsonValue,
        }),
        ...(dto.baseFee !== undefined && { baseFee: dto.baseFee }),
        ...(dto.pricePerKm !== undefined && { pricePerKm: dto.pricePerKm }),
        ...(dto.minDeliveryFee !== undefined && { minDeliveryFee: dto.minDeliveryFee }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async softDelete(id: string) {
    await this.ensure(id);
    await this.prisma.deliveryZone.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { ok: true };
  }

  /** How many active zones exist for this city / business / branch scope. */
  countScopedActive(scope: {
    cityId?: string;
    businessId?: string;
    branchId?: string;
  }) {
    return this.prisma.deliveryZone.count({
      where: {
        deletedAt: null,
        isActive: true,
        OR: this.scopeOr(scope),
      },
    });
  }

  private scopeOr(scope: {
    cityId?: string;
    businessId?: string;
    branchId?: string;
  }): Prisma.DeliveryZoneWhereInput[] {
    const { cityId, businessId, branchId } = scope;
    const or: Prisma.DeliveryZoneWhereInput[] = [];
    if (branchId) or.push({ branchId });
    if (businessId) {
      or.push({ businessId });
      or.push({ businessId, branchId: null });
    }
    if (cityId) {
      or.push({ cityId, businessId: null, branchId: null });
      or.push({ cityId });
    }
    if (!or.length) {
      or.push({ cityId: { not: null }, businessId: null, branchId: null });
    }
    return or;
  }

  /**
   * Find the best matching active zone for a delivery point.
   * Prefer branch → business → city scope; then smallest radius / first polygon hit.
   */
  async check(query: CheckDeliveryZoneQueryDto) {
    const { lat, lng, cityId, businessId, branchId } = query;
    const zones = await this.prisma.deliveryZone.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: this.scopeOr({ cityId, businessId, branchId }),
      },
      orderBy: { createdAt: 'asc' },
    });

    const hits = zones
      .map((z) => {
        const match = this.zoneContains(z, lat, lng);
        if (!match.inside) return null;
        return { zone: z, distanceKm: match.distanceKm };
      })
      .filter(Boolean) as Array<{
      zone: (typeof zones)[0];
      distanceKm: number | null;
    }>;

    if (!hits.length) {
      return { deliverable: false, zone: null, feeEstimate: null };
    }

    hits.sort((a, b) => {
      const sa = this.scopeScore(a.zone);
      const sb = this.scopeScore(b.zone);
      if (sa !== sb) return sb - sa;
      return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
    });

    const best = hits[0];
    const base = Number(best.zone.baseFee);
    const perKm = Number(best.zone.pricePerKm);
    const minFee = Number(best.zone.minDeliveryFee);
    const dist = best.distanceKm ?? 0;
    const feeEstimate = Math.max(minFee, base + perKm * dist);

    return {
      deliverable: true,
      zone: {
        id: best.zone.id,
        name: best.zone.name,
        cityId: best.zone.cityId,
        businessId: best.zone.businessId,
        branchId: best.zone.branchId,
      },
      distanceKm: best.distanceKm,
      feeEstimate,
    };
  }

  private scopeScore(z: {
    branchId: string | null;
    businessId: string | null;
    cityId: string | null;
  }) {
    if (z.branchId) return 3;
    if (z.businessId) return 2;
    if (z.cityId) return 1;
    return 0;
  }

  private zoneContains(
    z: {
      centerLatitude: Prisma.Decimal | null;
      centerLongitude: Prisma.Decimal | null;
      radiusKm: Prisma.Decimal | null;
      polygon: Prisma.JsonValue | null;
    },
    lat: number,
    lng: number,
  ): { inside: boolean; distanceKm: number | null } {
    if (z.radiusKm != null && z.centerLatitude != null && z.centerLongitude != null) {
      const d = distanceKm(
        lat,
        lng,
        Number(z.centerLatitude),
        Number(z.centerLongitude),
      );
      return { inside: d <= Number(z.radiusKm), distanceKm: d };
    }
    if (z.polygon) {
      return {
        inside: pointInGeoJson(lat, lng, z.polygon),
        distanceKm: null,
      };
    }
    return { inside: false, distanceKm: null };
  }

  private assertGeometry(
    dto: Pick<
      CreateDeliveryZoneDto,
      'radiusKm' | 'centerLatitude' | 'centerLongitude' | 'polygon'
    >,
  ) {
    const hasCircle =
      dto.radiusKm != null &&
      dto.centerLatitude != null &&
      dto.centerLongitude != null;
    const hasPolygon = dto.polygon != null;
    if (!hasCircle && !hasPolygon) {
      throw new BadRequestException(
        'Provide circle (centerLatitude, centerLongitude, radiusKm) or polygon',
      );
    }
  }

  private async validateRefs(
    dto: Pick<CreateDeliveryZoneDto, 'cityId' | 'businessId' | 'branchId'>,
  ) {
    if (dto.cityId) {
      const city = await this.prisma.city.findFirst({
        where: { id: dto.cityId, deletedAt: null },
      });
      if (!city) throw new NotFoundException('City not found');
    }
    if (dto.businessId) {
      const biz = await this.prisma.business.findFirst({
        where: { id: dto.businessId, deletedAt: null },
      });
      if (!biz) throw new NotFoundException('Business not found');
    }
    if (dto.branchId) {
      const branch = await this.prisma.businessBranch.findFirst({
        where: { id: dto.branchId, deletedAt: null },
      });
      if (!branch) throw new NotFoundException('Branch not found');
    }
  }

  private async ensure(id: string) {
    const row = await this.prisma.deliveryZone.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Delivery zone not found');
    return row;
  }
}
