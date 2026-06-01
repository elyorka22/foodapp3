import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { resolveBusinessId } from '../../domain/business/business-id.util';
import { UpdateCategoryDto } from './dto/update-category.dto';

/** Product menu categories (Fruits, Drinks, …) scoped to a business. */
@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findByBusiness(businessId: string, includeInactive = false) {
    return this.prisma.productCategory.findMany({
      where: {
        businessId,
        deletedAt: null,
        ...(!includeInactive && { isActive: true }),
      },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    });
  }

  /** @deprecated use findByBusiness */
  findByRestaurant(restaurantId: string, includeInactive = false) {
    return this.findByBusiness(restaurantId, includeInactive);
  }

  create(
    data: {
      businessId?: string;
      restaurantId?: string;
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      imageUrl?: string;
      sortOrder?: number;
    },
    user: JwtPayload,
  ) {
    const businessId = resolveBusinessId({
      businessId: data.businessId,
      restaurantId: data.restaurantId,
    });
    if (!businessId) throw new NotFoundException('businessId is required');
    this.assertAccess(businessId, user);
    return this.prisma.productCategory.create({
      data: {
        businessId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto, user: JwtPayload) {
    const category = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Product category not found');
    this.assertAccess(category.businessId, user);
    return this.prisma.productCategory.update({ where: { id }, data: dto });
  }

  async softDelete(id: string, user: JwtPayload) {
    const category = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Product category not found');
    this.assertAccess(category.businessId, user);
    return this.prisma.productCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private assertAccess(businessId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) {
      return;
    }
    const userBusinessId = user.businessId ?? user.restaurantId;
    if (userBusinessId !== businessId) throw new ForbiddenException();
  }
}
