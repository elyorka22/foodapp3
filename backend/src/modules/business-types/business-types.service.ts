import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';
import { resolveSlugForCreate, resolveSlugForUpdate } from '../../common/utils/slug.util';
import { kindFromMenuMode } from '../../common/utils/business-kind.util';

@Injectable()
export class BusinessTypesService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.businessType.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.businessType.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const row = await this.prisma.businessType.findFirst({
      where: { slug, isActive: true, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Business type not found');
    return row;
  }

  private async isBusinessTypeSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const row = await this.prisma.businessType.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    return !!row;
  }

  async create(dto: CreateBusinessTypeDto) {
    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (s) => this.isBusinessTypeSlugTaken(s),
    });
    const catalogMode =
      dto.catalogMode === 'CONTACT' ? 'CATALOG' : (dto.catalogMode ?? 'CATALOG');
    const menuMode =
      dto.menuMode ??
      (slug === 'restaurant' ? 'GLOBAL_DISH' : 'OWN_CATEGORIES');
    return this.prisma.businessType.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        icon: dto.icon?.trim(),
        imageUrl: dto.imageUrl,
        imageScale: dto.imageScale ?? 100,
        imagePositionX: dto.imagePositionX ?? 50,
        imagePositionY: dto.imagePositionY ?? 50,
        catalogMode,
        menuMode,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateBusinessTypeDto) {
    await this.ensure(id);
    const data: Prisma.BusinessTypeUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.slug !== undefined) {
      data.slug = await resolveSlugForUpdate({
        slug: dto.slug,
        isTaken: (s) => this.isBusinessTypeSlugTaken(s, id),
      });
    }
    if (dto.description !== undefined) data.description = dto.description?.trim();
    if (dto.icon !== undefined) data.icon = dto.icon?.trim();
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.imageScale !== undefined) data.imageScale = dto.imageScale;
    if (dto.imagePositionX !== undefined) data.imagePositionX = dto.imagePositionX;
    if (dto.imagePositionY !== undefined) data.imagePositionY = dto.imagePositionY;
    if (dto.catalogMode !== undefined) {
      data.catalogMode = dto.catalogMode === 'CONTACT' ? 'CATALOG' : dto.catalogMode;
    }
    if (dto.menuMode !== undefined) data.menuMode = dto.menuMode;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    const updated = await this.prisma.businessType.update({ where: { id }, data });
    // Keep denormalized Business.kind in sync with menuMode (source of truth).
    if (dto.menuMode !== undefined) {
      await this.prisma.business.updateMany({
        where: { businessTypeId: id, deletedAt: null },
        data: { kind: kindFromMenuMode(dto.menuMode) },
      });
    }
    return updated;
  }

  async remove(id: string) {
    await this.ensure(id);
    await this.prisma.businessType.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
    return { ok: true };
  }

  private async ensure(id: string) {
    const row = await this.prisma.businessType.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Business type not found');
    return row;
  }
}
