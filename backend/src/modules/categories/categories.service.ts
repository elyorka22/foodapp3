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

/** Store product categories — preferred scope is shared per BusinessType. */
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

  /** Type-scoped shared catalog (businessTypeId set, businessId null). */
  async findByBusinessType(
    opts: { businessTypeId?: string; typeSlug?: string },
    includeInactive = false,
  ) {
    const typeId = await this.resolveBusinessTypeId(opts);
    return this.prisma.productCategory.findMany({
      where: {
        businessTypeId: typeId,
        businessId: null,
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

  /** Restaurants → global dish categories; stores → type-scoped product categories. */
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

    if (!business.businessTypeId) {
      return [];
    }

    return this.findByBusinessType(
      { businessTypeId: business.businessTypeId },
      includeInactive,
    );
  }

  async create(
    data: {
      businessTypeId?: string;
      type?: string;
      businessId?: string;
      restaurantId?: string;
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      imageUrl?: string;
      imageScale?: number;
      imagePositionX?: number;
      imagePositionY?: number;
      sortOrder?: number;
    },
    user: JwtPayload,
  ) {
    this.assertAdminOnly(user);

    let businessTypeId =
      data.businessTypeId?.trim() ||
      (data.type?.trim()
        ? await this.resolveBusinessTypeId({ typeSlug: data.type.trim() })
        : null);

    // Legacy: resolve type from a store when only businessId is sent.
    if (!businessTypeId) {
      const businessId = resolveBusinessId({
        businessId: data.businessId,
        restaurantId: data.restaurantId,
      });
      if (businessId) {
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
        if (!business.businessTypeId) {
          throw new BadRequestException('Business has no business type');
        }
        businessTypeId = business.businessTypeId;
      }
    }

    if (!businessTypeId) {
      throw new BadRequestException('businessTypeId or type is required');
    }

    await this.assertStoreBusinessType(businessTypeId);

    return this.prisma.productCategory.create({
      data: {
        businessTypeId,
        businessId: null,
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        imageUrl: data.imageUrl,
        imageScale: data.imageScale ?? 100,
        imagePositionX: data.imagePositionX ?? 50,
        imagePositionY: data.imagePositionY ?? 50,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto, user: JwtPayload) {
    this.assertAdminOnly(user);
    const category = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Product category not found');
    return this.prisma.productCategory.update({ where: { id }, data: dto });
  }

  async softDelete(id: string, user: JwtPayload) {
    this.assertAdminOnly(user);
    const category = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Product category not found');
    return this.prisma.productCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private async resolveBusinessTypeId(opts: {
    businessTypeId?: string;
    typeSlug?: string;
  }): Promise<string> {
    if (opts.businessTypeId?.trim()) {
      const type = await this.prisma.businessType.findFirst({
        where: { id: opts.businessTypeId.trim(), deletedAt: null },
      });
      if (!type) throw new NotFoundException('Business type not found');
      return type.id;
    }
    const slug = opts.typeSlug?.trim();
    if (!slug) {
      throw new BadRequestException('businessTypeId or type is required');
    }
    const type = await this.prisma.businessType.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!type) throw new NotFoundException('Business type not found');
    return type.id;
  }

  private async assertStoreBusinessType(businessTypeId: string) {
    const type = await this.prisma.businessType.findFirst({
      where: { id: businessTypeId, deletedAt: null },
    });
    if (!type) throw new NotFoundException('Business type not found');
    if (type.menuMode === 'GLOBAL_DISH' || type.slug === 'restaurant') {
      throw new BadRequestException(
        'Restaurants use global dish categories — POST /dish-categories',
      );
    }
  }

  private assertAdminOnly(user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) {
      return;
    }
    throw new ForbiddenException(
      'Only admin can manage shared store categories',
    );
  }
}
