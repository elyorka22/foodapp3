import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveSlugForCreate, resolveSlugForUpdate } from '../../common/utils/slug.util';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.city.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        isDefault: true,
      },
    });
  }

  findAllAdmin() {
    return this.prisma.city.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  private async isSlugTaken(slug: string, excludeId?: string) {
    const row = await this.prisma.city.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    return !!row;
  }

  private async clearOtherDefaults(exceptId?: string) {
    await this.prisma.city.updateMany({
      where: {
        deletedAt: null,
        isDefault: true,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { isDefault: false },
    });
  }

  async create(dto: CreateCityDto) {
    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (s) => this.isSlugTaken(s),
    });
    const isDefault = dto.isDefault ?? false;
    if (isDefault) {
      await this.clearOtherDefaults();
    }
    return this.prisma.city.create({
      data: {
        name: dto.name.trim(),
        slug,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        isDefault,
      },
    });
  }

  async update(id: string, dto: UpdateCityDto) {
    const existing = await this.prisma.city.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('City not found');

    if (dto.isDefault === true) {
      await this.clearOtherDefaults(id);
    }

    const data: {
      name?: string;
      slug?: string;
      sortOrder?: number;
      isActive?: boolean;
      isDefault?: boolean;
    } = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.slug !== undefined) {
      data.slug = await resolveSlugForUpdate({
        slug: dto.slug,
        isTaken: (s) => this.isSlugTaken(s, id),
      });
    }
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;

    return this.prisma.city.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    const existing = await this.prisma.city.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('City not found');

    return this.prisma.city.update({
      where: { id },
      data: {
        isActive: false,
        isDefault: false,
        deletedAt: new Date(),
      },
    });
  }
}
