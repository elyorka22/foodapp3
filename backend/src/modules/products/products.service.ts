import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessKind, Prisma, UserRole } from '@prisma/client';
import { isRestaurantKind, isStoreKind } from '../../common/utils/business-kind.util';
import { sortMenuProducts } from '../../common/utils/menu-order.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { userBusinessId, resolveBusinessId } from '../../domain/business/business-id.util';
import { businessWhereForVertical } from '../../domain/business/merchant-vertical';
import { resolveSlugForCreate, resolveSlugForUpdate, slugifyName } from '../../common/utils/slug.util';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductsQueryDto } from './dto/admin-products-query.dto';
import { BulkProductAction, BulkProductsDto } from './dto/bulk-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findByBusiness(businessId: string, categoryId?: string, publicMenu = false) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      include: { businessType: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    const rows = await this.prisma.product.findMany({
      where: {
        businessId,
        deletedAt: null,
        ...(publicMenu && { isAvailable: true }),
        ...(categoryId && {
          OR: [{ dishCategoryId: categoryId }, { productCategoryId: categoryId }],
        }),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategory: true,
        dishCategory: true,
        business: { select: { id: true, name: true, slug: true } },
      },
    });
    const sorted = sortMenuProducts(rows, isRestaurantKind(business));
    return sorted.map((p) => this.mapProduct(p));
  }

  async findByDishCategory(params: {
    dishCategoryId?: string;
    categorySlug?: string;
    page?: number;
    limit?: number;
  }) {
    let dishCategoryId = params.dishCategoryId;
    if (!dishCategoryId && params.categorySlug) {
      const cat = await this.prisma.dishCategory.findFirst({
        where: {
          slug: params.categorySlug,
          isActive: true,
          deletedAt: null,
        },
      });
      if (!cat) throw new NotFoundException('Dish category not found');
      dishCategoryId = cat.id;
    }
    if (!dishCategoryId) {
      throw new BadRequestException('dishCategoryId or categorySlug is required');
    }

    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 24, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      dishCategoryId,
      deletedAt: null,
      isAvailable: true,
      business: {
        deletedAt: null,
        isActive: true,
        approvalStatus: 'APPROVED',
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          dishCategory: true,
          business: { select: { id: true, name: true, slug: true, logoUrl: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginatedResponse(
      data.map((p) => this.mapProduct(p)),
      total,
      page,
      limit,
    );
  }

  private mapProduct(p: {
    price: Prisma.Decimal;
    comparePrice: Prisma.Decimal | null;
    [key: string]: unknown;
  }) {
    return {
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
    };
  }

  /** @deprecated use findByBusiness */
  findByRestaurant(businessId: string, categoryId?: string, publicMenu = false) {
    return this.findByBusiness(businessId, categoryId, publicMenu);
  }

  async findAllAdmin(query: AdminProductsQueryDto, user: JwtPayload) {
    const { skip, take } = paginate(query.page, query.limit);
    const businessFilter = resolveBusinessId({
      businessId: query.businessId,
      restaurantId: query.restaurantId,
    });

    const verticalBusiness = businessWhereForVertical(query.vertical);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(businessFilter && { businessId: businessFilter }),
      ...(query.categoryId && {
        OR: [{ dishCategoryId: query.categoryId }, { productCategoryId: query.categoryId }],
      }),
      ...(query.isAvailable !== undefined && { isAvailable: query.isAvailable }),
      ...(verticalBusiness && !businessFilter && { business: verticalBusiness }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    if (user.role === UserRole.BUSINESS) {
      const scopeId = userBusinessId(user);
      if (!scopeId) throw new ForbiddenException();
      where.businessId = scopeId;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          productCategory: true,
          dishCategory: true,
          business: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const mapped = data.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      category: p.dishCategory ?? p.productCategory ?? null,
    }));

    return paginatedResponse(mapped, total, query.page ?? 1, query.limit ?? 20);
  }

  async create(dto: CreateProductDto, user: JwtPayload) {
    const businessId = resolveBusinessId({
      businessId: dto.businessId,
      restaurantId: dto.restaurantId,
    });
    if (!businessId) throw new NotFoundException('businessId is required');
    this.assertAccess(businessId, user);

    const business = await this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      include: { businessType: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    const dishCategoryId = dto.dishCategoryId ?? dto.categoryId;
    const productCategoryId = dto.productCategoryId;
    this.assertCategoryFields(business, dishCategoryId, productCategoryId);

    if (dishCategoryId) {
      await this.assertDishCategoryExists(dishCategoryId);
    }
    if (productCategoryId) {
      const cat = await this.prisma.productCategory.findFirst({
        where: { id: productCategoryId, businessId, deletedAt: null, isActive: true },
      });
      if (!cat) throw new NotFoundException('Store category not found');
    }

    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (candidate) => this.isProductSlugTaken(businessId, candidate),
    });

    const product = await this.prisma.product.create({
      data: {
        businessId,
        dishCategoryId: dishCategoryId ?? undefined,
        productCategoryId: productCategoryId ?? undefined,
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        comparePrice: dto.comparePrice,
        isAvailable: dto.isAvailable ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        images: true,
        productCategory: true,
        dishCategory: true,
        business: { select: { id: true, name: true } },
      },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'create',
      entity: 'product',
      entityId: product.id,
      metadata: { name: product.name },
    });
    return this.mapProduct(product);
  }

  async update(id: string, dto: Partial<CreateProductDto>, user: JwtPayload) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundException();
    this.assertAccess(existing.businessId, user);

    const business = await this.prisma.business.findFirst({
      where: { id: existing.businessId, deletedAt: null },
      include: { businessType: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    const nextDishCategoryId =
      dto.dishCategoryId !== undefined
        ? dto.dishCategoryId
        : dto.categoryId !== undefined
          ? dto.categoryId
          : undefined;
    const nextProductCategoryId =
      dto.productCategoryId !== undefined ? dto.productCategoryId : undefined;

    this.assertCategoryFields(
      business,
      nextDishCategoryId ?? existing.dishCategoryId,
      nextProductCategoryId ?? existing.productCategoryId,
    );

    if (nextDishCategoryId) {
      await this.assertDishCategoryExists(nextDishCategoryId);
    }
    if (nextProductCategoryId) {
      const cat = await this.prisma.productCategory.findFirst({
        where: {
          id: nextProductCategoryId,
          businessId: existing.businessId,
          deletedAt: null,
          isActive: true,
        },
      });
      if (!cat) throw new NotFoundException('Store category not found');
    }

    let nextSlug: string | undefined;
    if (dto.slug !== undefined) {
      const normalized = slugifyName(dto.slug);
      if (normalized !== existing.slug) {
        nextSlug = await resolveSlugForUpdate({
          slug: dto.slug,
          isTaken: (candidate) => this.isProductSlugTaken(existing.businessId, candidate, id),
        });
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(nextSlug !== undefined && { slug: nextSlug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.comparePrice !== undefined && { comparePrice: dto.comparePrice }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(nextDishCategoryId !== undefined && { dishCategoryId: nextDishCategoryId }),
        ...(dto.productCategoryId !== undefined && { productCategoryId: dto.productCategoryId }),
      },
      include: {
        images: true,
        productCategory: true,
        dishCategory: true,
        business: { select: { id: true, name: true } },
      },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'update',
      entity: 'product',
      entityId: id,
      metadata: dto,
    });
    return this.mapProduct(product);
  }

  async addImage(id: string, url: string, user: JwtPayload) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product || product.deletedAt) throw new NotFoundException();
    this.assertAccess(product.businessId, user);

    // Replace existing photos so a new upload becomes the visible product image.
    if (product.images.length > 0) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
    }

    return this.prisma.productImage.create({
      data: {
        productId: id,
        url,
        isPrimary: true,
        sortOrder: 0,
      },
    });
  }

  async bulk(dto: BulkProductsDto, user: JwtPayload) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.ids }, deletedAt: null },
    });
    if (!products.length) throw new NotFoundException('No products found');

    for (const p of products) {
      this.assertAccess(p.businessId, user);
    }

    if (dto.action === BulkProductAction.DELETE) {
      if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BUSINESS) {
        throw new ForbiddenException();
      }
      await this.prisma.product.updateMany({
        where: { id: { in: dto.ids } },
        data: { deletedAt: new Date(), isAvailable: false },
      });
      await this.audit.log({
        userId: user.sub,
        action: 'bulk_delete',
        entity: 'product',
        metadata: { ids: dto.ids },
      });
      return { updated: dto.ids.length };
    }

    const isAvailable = dto.action === BulkProductAction.ACTIVATE;
    await this.prisma.product.updateMany({
      where: { id: { in: dto.ids } },
      data: { isAvailable },
    });
    await this.audit.log({
      userId: user.sub,
      action: dto.action,
      entity: 'product',
      metadata: { ids: dto.ids },
    });
    return { updated: dto.ids.length };
  }

  async softDelete(id: string, user: JwtPayload) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    this.assertAccess(existing.businessId, user);
    const product = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isAvailable: false },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'delete',
      entity: 'product',
      entityId: id,
    });
    return product;
  }

  private async isProductSlugTaken(
    businessId: string,
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const row = await this.prisma.product.findFirst({
      where: {
        businessId,
        slug,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
    return !!row;
  }

  private assertAccess(businessId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (userBusinessId(user) !== businessId) throw new ForbiddenException();
  }

  private async assertDishCategoryExists(dishCategoryId: string) {
    const cat = await this.prisma.dishCategory.findFirst({
      where: { id: dishCategoryId, deletedAt: null, isActive: true },
    });
    if (cat) return;

    const legacy = await this.prisma.productCategory.findFirst({
      where: { id: dishCategoryId, deletedAt: null },
    });
    if (legacy) {
      throw new BadRequestException(
        'Selected category is a per-store category. Choose a global dish category from the list',
      );
    }
    throw new NotFoundException('Dish category not found');
  }

  private assertCategoryFields(
    business: { kind: BusinessKind; businessType?: { slug?: string | null } | null },
    dishCategoryId?: string | null,
    productCategoryId?: string | null,
  ) {
    if (isRestaurantKind(business)) {
      if (productCategoryId) {
        throw new BadRequestException('Restaurants use global dish categories only');
      }
      if (!dishCategoryId) {
        throw new BadRequestException('Dish category is required for restaurant menu items');
      }
      return;
    }
    if (isStoreKind(business)) {
      if (dishCategoryId) {
        throw new BadRequestException('Stores use their own product categories only');
      }
      if (!productCategoryId) {
        throw new BadRequestException('Store category is required for store products');
      }
    }
  }
}
