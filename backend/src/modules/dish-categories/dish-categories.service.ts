import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveSlugForCreate, resolveSlugForUpdate } from '../../common/utils/slug.util';
import { CreateDishCategoryDto } from './dto/create-dish-category.dto';
import { UpdateDishCategoryDto } from './dto/update-dish-category.dto';

@Injectable()
export class DishCategoriesService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.dishCategory.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            products: {
              where: { deletedAt: null, isAvailable: true },
            },
          },
        },
      },
    });
  }

  findAllAdmin() {
    return this.prisma.dishCategory.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            products: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const row = await this.prisma.dishCategory.findFirst({
      where: { slug, isActive: true, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Dish category not found');
    return row;
  }

  private async isSlugTaken(slug: string, excludeId?: string) {
    const row = await this.prisma.dishCategory.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    return !!row;
  }

  async create(dto: CreateDishCategoryDto) {
    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (s) => this.isSlugTaken(s),
    });
    return this.prisma.dishCategory.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        icon: dto.icon?.trim(),
        imageUrl: dto.imageUrl,
        imageScale: dto.imageScale ?? 100,
        imagePositionX: dto.imagePositionX ?? 50,
        imagePositionY: dto.imagePositionY ?? 50,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateDishCategoryDto) {
    await this.ensure(id);
    const data: Prisma.DishCategoryUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.slug !== undefined) {
      data.slug = await resolveSlugForUpdate({
        slug: dto.slug,
        isTaken: (s) => this.isSlugTaken(s, id),
      });
    }
    if (dto.description !== undefined) data.description = dto.description?.trim();
    if (dto.icon !== undefined) data.icon = dto.icon?.trim();
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.imageScale !== undefined) data.imageScale = dto.imageScale;
    if (dto.imagePositionX !== undefined) data.imagePositionX = dto.imagePositionX;
    if (dto.imagePositionY !== undefined) data.imagePositionY = dto.imagePositionY;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return this.prisma.dishCategory.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.ensure(id);
    return this.prisma.dishCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private async ensure(id: string) {
    const row = await this.prisma.dishCategory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Dish category not found');
    return row;
  }
}
