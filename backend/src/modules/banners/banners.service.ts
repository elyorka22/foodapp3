import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveBannerFraming } from '../../common/utils/image-framing.util';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from '../settings/settings.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private settings: SettingsService,
  ) {}

  private businessPublicPath(business: { id: string; slug: string | null }) {
    const slug = business.slug?.trim();
    return slug ? `/restaurants/${slug}` : `/restaurants/${business.id}`;
  }

  private async resolveRestaurantLink(restaurantId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: restaurantId },
      select: { id: true, slug: true },
    });
    if (!business) return null;
    return this.businessPublicPath(business);
  }

  private async mapBanner<T extends {
    imageScale?: number | null;
    imagePositionX?: number | null;
    imagePositionY?: number | null;
  }>(row: T) {
    const defaults = await this.settings.getImageFramingDefaults();
    const framing = resolveBannerFraming(row, defaults);
    return { ...row, ...framing };
  }

  async findActive() {
    const now = new Date();
    const rows = await this.prisma.banner.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      include: {
        business: { select: { id: true, slug: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    const defaults = await this.settings.getImageFramingDefaults();
    return rows.map((row) => {
      const linkUrl =
        row.linkUrl?.trim() ||
        (row.business ? this.businessPublicPath(row.business) : null);
      return {
        ...row,
        ...resolveBannerFraming(row, defaults),
        linkUrl,
        restaurantId: row.businessId,
      };
    });
  }

  findAllAdmin() {
    return this.prisma.banner.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(dto: CreateBannerDto, user?: JwtPayload) {
    let linkUrl = dto.link?.trim() || null;
    if (dto.restaurantId) {
      linkUrl = await this.resolveRestaurantLink(dto.restaurantId);
    }

    const banner = await this.prisma.banner.create({
      data: {
        title: dto.title?.trim() ?? '',
        description: dto.description?.trim() || null,
        imageUrl: dto.imageUrl,
        linkUrl,
        placement: dto.placement ?? 'HERO',
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        businessId: dto.restaurantId,
        imageScale: dto.imageScale ?? null,
        imagePositionX: dto.imagePositionX ?? null,
        imagePositionY: dto.imagePositionY ?? null,
      },
    });
    await this.audit.log({
      userId: user?.sub,
      action: 'create',
      entity: 'banner',
      entityId: banner.id,
      metadata: { title: banner.title },
    });
    return this.mapBanner(banner);
  }

  async update(id: string, dto: UpdateBannerDto, user?: JwtPayload) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
    if (!banner) throw new NotFoundException('Banner not found');

    const data: Prisma.BannerUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim() || null;
    if (dto.placement !== undefined) data.placement = dto.placement;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.imageScale !== undefined) data.imageScale = dto.imageScale;
    if (dto.imagePositionX !== undefined) data.imagePositionX = dto.imagePositionX;
    if (dto.imagePositionY !== undefined) data.imagePositionY = dto.imagePositionY;
    if (dto.restaurantId !== undefined) {
      data.business = dto.restaurantId
        ? { connect: { id: dto.restaurantId } }
        : { disconnect: true };
      if (dto.restaurantId) {
        data.linkUrl = await this.resolveRestaurantLink(dto.restaurantId);
      } else if (dto.link !== undefined) {
        data.linkUrl = dto.link?.trim() || null;
      }
    } else if (dto.link !== undefined) {
      data.linkUrl = dto.link?.trim() || null;
    }

    const updated = await this.prisma.banner.update({ where: { id }, data });
    await this.audit.log({
      userId: user?.sub,
      action: 'update',
      entity: 'banner',
      entityId: id,
      metadata: dto,
    });
    return this.mapBanner(updated);
  }

  async softDelete(id: string, user?: JwtPayload) {
    const existing = await this.prisma.banner.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Banner not found');

    const deleted = await this.prisma.banner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.audit.log({
      userId: user?.sub,
      action: 'delete',
      entity: 'banner',
      entityId: id,
    });
    return deleted;
  }

  async reorder(orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.prisma.banner.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.findAllAdmin();
  }
}
