import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';

@Injectable()
export class BusinessTypesService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.businessType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.businessType.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const row = await this.prisma.businessType.findFirst({
      where: { slug, isActive: true },
    });
    if (!row) throw new NotFoundException('Business type not found');
    return row;
  }

  async create(dto: CreateBusinessTypeDto) {
    return this.prisma.businessType.create({
      data: {
        name: dto.name.trim(),
        slug: dto.slug.trim().toLowerCase(),
        description: dto.description?.trim(),
        icon: dto.icon?.trim(),
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateBusinessTypeDto) {
    await this.ensure(id);
    const data: Prisma.BusinessTypeUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.slug !== undefined) data.slug = dto.slug.trim().toLowerCase();
    if (dto.description !== undefined) data.description = dto.description?.trim();
    if (dto.icon !== undefined) data.icon = dto.icon?.trim();
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return this.prisma.businessType.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.ensure(id);
    await this.prisma.businessType.update({
      where: { id },
      data: { isActive: false },
    });
    return { ok: true };
  }

  private async ensure(id: string) {
    const row = await this.prisma.businessType.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Business type not found');
    return row;
  }
}
