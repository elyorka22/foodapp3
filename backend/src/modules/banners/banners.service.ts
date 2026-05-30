import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  findActive() {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.banner.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(dto: CreateBannerDto, user?: JwtPayload) {
    const banner = await this.prisma.banner.create({
      data: {
        title: dto.title?.trim() ?? '',
        description: dto.description?.trim() || null,
        imageUrl: dto.imageUrl,
        linkUrl: dto.link,
        placement: dto.placement ?? 'HERO',
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        restaurantId: dto.restaurantId,
      },
    });
    await this.audit.log({
      userId: user?.sub,
      action: 'create',
      entity: 'banner',
      entityId: banner.id,
      metadata: { title: banner.title },
    });
    return banner;
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
    if (dto.link !== undefined) data.linkUrl = dto.link;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.restaurantId !== undefined) {
      data.restaurant = dto.restaurantId
        ? { connect: { id: dto.restaurantId } }
        : { disconnect: true };
    }

    const updated = await this.prisma.banner.update({ where: { id }, data });
    await this.audit.log({
      userId: user?.sub,
      action: 'update',
      entity: 'banner',
      entityId: id,
      metadata: dto,
    });
    return updated;
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
