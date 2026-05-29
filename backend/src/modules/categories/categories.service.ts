import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findByRestaurant(restaurantId: string, includeInactive = false) {
    return this.prisma.category.findMany({
      where: {
        restaurantId,
        deletedAt: null,
        ...(!includeInactive && { isActive: true }),
      },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    });
  }

  create(data: { restaurantId: string; name: string; slug: string }, user: JwtPayload) {
    this.assertAccess(data.restaurantId, user);
    return this.prisma.category.create({ data });
  }

  async update(id: string, dto: UpdateCategoryDto, user: JwtPayload) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');
    this.assertAccess(category.restaurantId, user);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async softDelete(id: string, user: JwtPayload) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');
    this.assertAccess(category.restaurantId, user);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private assertAccess(restaurantId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (user.restaurantId !== restaurantId) throw new ForbiddenException();
  }
}
