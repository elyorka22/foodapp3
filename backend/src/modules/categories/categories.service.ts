import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { isRestaurantKind } from '../../common/utils/business-kind.util';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { resolveBusinessId } from '../../domain/business/business-id.util';
import { DishCategoriesService } from '../dish-categories/dish-categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

/** Store product categories (Fruits, Drinks, …) scoped to a business. */
@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private dishCategories: DishCategoriesService,
  ) {}

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

  /** Restaurants → global dish categories; stores → per-business product categories. */
  async findForBusinessMenu(businessId: string, includeInactive = false) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      include: { businessType: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    if (isRestaurantKind(business)) {
      return includeInactive
        ? this.dishCategories.findAllAdmin()
        : this.dishCategories.findAllPublic();
    }

    return this.findByBusiness(businessId, includeInactive);
  }

  async create(
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
    await this.assertStoreBusiness(businessId);
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

  private async assertStoreBusiness(businessId: string) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      include: { businessType: true },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (isRestaurantKind(business)) {
      throw new BadRequestException(
        'Restaurants use global dish categories — select one when creating a menu item',
      );
    }
  }

  private assertAccess(businessId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) {
      return;
    }
    const userBusinessId = user.businessId ?? user.restaurantId;
    if (userBusinessId !== businessId) throw new ForbiddenException();
  }
}
