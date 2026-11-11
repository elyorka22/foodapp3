import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessKind, BusinessMenuMode, Prisma, UserRole } from '@prisma/client';
import {
  isRestaurantKind,
  isStoreKind,
  usesSharedCatalog,
} from '../../common/utils/business-kind.util';
import { sortMenuProducts } from '../../common/utils/menu-order.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { userBusinessId, resolveBusinessId } from '../../domain/business/business-id.util';
import { businessWhereForVertical } from '../../domain/business/merchant-vertical';
import { resolveSlugForCreate, resolveSlugForUpdate, slugifyName } from '../../common/utils/slug.util';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateSharedProductDto, UpdateOfferDto } from './dto/create-shared-product.dto';
import { EnrollCatalogDto } from './dto/enroll-catalog.dto';
import { AdminProductsQueryDto } from './dto/admin-products-query.dto';
import { BulkProductAction, BulkProductsDto } from './dto/bulk-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findByBusiness(
    businessId: string,
    categoryId?: string,
    publicMenu = false,
    branchId?: string,
  ) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      include: { businessType: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    if (usesSharedCatalog(business)) {
      return this.findSharedCatalogMenu(business, {
        categoryId,
        publicMenu,
        branchId,
      });
    }

    const rows = await this.prisma.product.findMany({
      where: {
        businessId,
        deletedAt: null,
        ...(publicMenu && { isAvailable: true }),
        AND: [
          ...(branchId
            ? [{ OR: [{ branchId: null }, { branchId }] }]
            : []),
          ...(categoryId
            ? [
                {
                  OR: [
                    { dishCategoryId: categoryId },
                    { productCategoryId: categoryId },
                  ],
                },
              ]
            : []),
        ],
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategory: true,
        dishCategory: true,
        business: { select: { id: true, name: true, slug: true } },
        branch: { select: { id: true, name: true } },
      },
    });
    const sorted = sortMenuProducts(rows, isRestaurantKind(business));
    return sorted.map((p) => this.mapProduct(p));
  }

  /** SHARED_CATALOG: listed offers (effective price) + store-owned unique SKUs. */
  private async findSharedCatalogMenu(
    business: {
      id: string;
      businessTypeId: string | null;
      kind: BusinessKind;
      businessType?: { menuMode?: string | null; slug?: string | null } | null;
    },
    opts: { categoryId?: string; publicMenu: boolean; branchId?: string },
  ) {
    const offerWhere: Prisma.BusinessProductOfferWhereInput = {
      businessId: business.id,
      deletedAt: null,
      ...(opts.publicMenu
        ? { isListed: true, isAvailable: true, price: { not: null } }
        : {}),
      product: {
        deletedAt: null,
        businessId: null,
        ...(opts.publicMenu && { isAvailable: true }),
        ...(opts.categoryId && { productCategoryId: opts.categoryId }),
      },
    };

    const [offers, uniqueRows] = await Promise.all([
      this.prisma.businessProductOffer.findMany({
        where: offerWhere,
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' } },
              productCategory: true,
              dishCategory: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.product.findMany({
        where: {
          businessId: business.id,
          deletedAt: null,
          ...(opts.publicMenu && { isAvailable: true }),
          AND: [
            ...(opts.branchId
              ? [{ OR: [{ branchId: null }, { branchId: opts.branchId }] }]
              : []),
            ...(opts.categoryId ? [{ productCategoryId: opts.categoryId }] : []),
          ],
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          productCategory: true,
          dishCategory: true,
          business: { select: { id: true, name: true, slug: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
    ]);

    const fromOffers = offers.map((offer) => {
      const p = offer.product;
      const effectivePrice =
        offer.price != null
          ? Number(offer.price)
          : p.defaultPrice != null
            ? Number(p.defaultPrice)
            : Number(p.price);
      const effectiveCompare =
        offer.comparePrice != null
          ? Number(offer.comparePrice)
          : p.comparePrice != null
            ? Number(p.comparePrice)
            : null;
      return {
        ...p,
        price: effectivePrice,
        comparePrice: effectiveCompare,
        isAvailable: offer.isAvailable && p.isAvailable,
        offerId: offer.id,
        offerPrice: offer.price != null ? Number(offer.price) : null,
        offerComparePrice:
          offer.comparePrice != null ? Number(offer.comparePrice) : null,
        isListed: offer.isListed,
        isSharedCatalog: true,
        business: { id: business.id, name: undefined, slug: undefined },
      };
    });

    const fromUnique = uniqueRows.map((p) => ({
      ...this.mapProduct(p),
      isSharedCatalog: false,
      isListed: true,
      offerId: null as string | null,
    }));

    const merged = [...fromOffers, ...fromUnique];
    const sorted = sortMenuProducts(merged as any[], false);
    return sorted.map((p) => this.mapProduct(p as any));
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
    price: Prisma.Decimal | number;
    comparePrice?: Prisma.Decimal | number | null;
    defaultPrice?: Prisma.Decimal | number | null;
    [key: string]: unknown;
  }) {
    return {
      ...p,
      price: Number(p.price),
      comparePrice:
        p.comparePrice != null ? Number(p.comparePrice) : null,
      ...(p.defaultPrice !== undefined && {
        defaultPrice:
          p.defaultPrice != null ? Number(p.defaultPrice) : null,
      }),
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
    let businessTypeId = query.businessTypeId;
    if (!businessTypeId && query.type) {
      const bt = await this.prisma.businessType.findFirst({
        where: { slug: query.type, deletedAt: null },
        select: { id: true },
      });
      if (!bt) throw new NotFoundException('Business type not found');
      businessTypeId = bt.id;
    }

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(businessFilter && { businessId: businessFilter }),
      ...(businessTypeId && { businessTypeId }),
      ...(query.sharedOnly && { businessId: null, businessTypeId: { not: null } }),
      ...(query.categoryId && {
        OR: [{ dishCategoryId: query.categoryId }, { productCategoryId: query.categoryId }],
      }),
      ...(query.isAvailable !== undefined && { isAvailable: query.isAvailable }),
      ...(verticalBusiness &&
        !businessFilter &&
        !query.sharedOnly &&
        !businessTypeId && { business: verticalBusiness }),
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
      // Merchants only see their own SKUs here; offers use /products/offers.
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
      await this.assertStoreProductCategory(productCategoryId, business);
    }

    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (candidate) => this.isProductSlugTaken(businessId, candidate),
    });

    if (dto.branchId) {
      const branch = await this.prisma.businessBranch.findFirst({
        where: {
          id: dto.branchId,
          businessId,
          deletedAt: null,
        },
      });
      if (!branch) throw new NotFoundException('Branch not found for this business');
    }

    const product = await this.prisma.product.create({
      data: {
        businessId,
        branchId: dto.branchId ?? undefined,
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
        branch: { select: { id: true, name: true } },
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

    // Shared catalog rows are admin-only via updateShared / createShared.
    if (!existing.businessId) {
      throw new BadRequestException(
        'Use shared catalog endpoints to edit type-level products',
      );
    }
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
      await this.assertStoreProductCategory(nextProductCategoryId, business);
    }

    let nextSlug: string | undefined;
    if (dto.slug !== undefined) {
      const normalized = slugifyName(dto.slug);
      if (normalized !== existing.slug) {
        nextSlug = await resolveSlugForUpdate({
          slug: dto.slug,
          isTaken: (candidate) =>
            this.isProductSlugTaken(existing.businessId!, candidate, id),
        });
      }
    }

    if (dto.branchId) {
      const branch = await this.prisma.businessBranch.findFirst({
        where: {
          id: dto.branchId,
          businessId: existing.businessId,
          deletedAt: null,
        },
      });
      if (!branch) throw new NotFoundException('Branch not found for this business');
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
        ...(dto.branchId !== undefined && { branchId: dto.branchId || null }),
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
    if (!product.businessId) {
      this.assertAdmin(user);
    } else {
      this.assertAccess(product.businessId, user);
    }

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
      if (!p.businessId) {
        this.assertAdmin(user);
      } else {
        this.assertAccess(p.businessId, user);
      }
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
    if (!existing.businessId) {
      return this.softDeleteShared(id, user);
    }
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

  async listShared(
    query: { type?: string; businessTypeId?: string; page?: number; limit?: number; search?: string },
    _user: JwtPayload,
  ) {
    const businessTypeId = await this.resolveBusinessTypeId(
      query.businessTypeId,
      query.type,
    );
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      businessId: null,
      businessTypeId,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          productCategory: true,
          businessType: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginatedResponse(
      data.map((p) => this.mapProduct(p)),
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async createShared(dto: CreateSharedProductDto, user: JwtPayload) {
    this.assertAdmin(user);
    const businessTypeId = await this.resolveBusinessTypeId(
      dto.businessTypeId,
      dto.type,
    );
    const type = await this.prisma.businessType.findFirst({
      where: { id: businessTypeId, deletedAt: null },
    });
    if (!type) throw new NotFoundException('Business type not found');
    if (type.menuMode !== BusinessMenuMode.SHARED_CATALOG) {
      throw new BadRequestException(
        'Shared products are only for SHARED_CATALOG business types',
      );
    }
    if (dto.productCategoryId) {
      await this.assertTypeProductCategory(dto.productCategoryId, businessTypeId);
    }

    const listPrice = dto.price ?? dto.defaultPrice ?? 0;
    const slug = await resolveSlugForCreate({
      name: dto.name,
      slug: dto.slug,
      isTaken: (candidate) =>
        this.isSharedProductSlugTaken(businessTypeId, candidate),
    });

    const product = await this.prisma.product.create({
      data: {
        businessId: null,
        businessTypeId,
        productCategoryId: dto.productCategoryId ?? undefined,
        name: dto.name,
        slug,
        description: dto.description,
        price: listPrice,
        defaultPrice: dto.defaultPrice ?? dto.price ?? null,
        comparePrice: dto.comparePrice,
        isAvailable: dto.isAvailable ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        images: true,
        productCategory: true,
        businessType: { select: { id: true, name: true, slug: true } },
      },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'create',
      entity: 'shared_product',
      entityId: product.id,
      metadata: { name: product.name, businessTypeId },
    });
    return this.mapProduct(product);
  }

  async updateShared(
    id: string,
    dto: Partial<CreateSharedProductDto>,
    user: JwtPayload,
  ) {
    this.assertAdmin(user);
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || existing.deletedAt || existing.businessId) {
      throw new NotFoundException('Shared product not found');
    }
    if (!existing.businessTypeId) {
      throw new BadRequestException('Product is not a shared catalog row');
    }

    if (dto.productCategoryId) {
      await this.assertTypeProductCategory(
        dto.productCategoryId,
        existing.businessTypeId,
      );
    }

    let nextSlug: string | undefined;
    if (dto.slug !== undefined) {
      const normalized = slugifyName(dto.slug);
      if (normalized !== existing.slug) {
        nextSlug = await resolveSlugForUpdate({
          slug: dto.slug,
          isTaken: (candidate) =>
            this.isSharedProductSlugTaken(
              existing.businessTypeId!,
              candidate,
              id,
            ),
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
        ...(dto.defaultPrice !== undefined && { defaultPrice: dto.defaultPrice }),
        ...(dto.comparePrice !== undefined && { comparePrice: dto.comparePrice }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.productCategoryId !== undefined && {
          productCategoryId: dto.productCategoryId,
        }),
      },
      include: {
        images: true,
        productCategory: true,
        businessType: { select: { id: true, name: true, slug: true } },
      },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'update',
      entity: 'shared_product',
      entityId: id,
      metadata: dto,
    });
    return this.mapProduct(product);
  }

  async softDeleteShared(id: string, user: JwtPayload) {
    this.assertAdmin(user);
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || existing.businessId) {
      throw new NotFoundException('Shared product not found');
    }
    const product = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isAvailable: false },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'delete',
      entity: 'shared_product',
      entityId: id,
    });
    return product;
  }

  async enrollCatalog(dto: EnrollCatalogDto, user: JwtPayload) {
    const businessId = resolveBusinessId({
      businessId: dto.businessId,
      restaurantId: dto.restaurantId,
    });
    if (!businessId) throw new BadRequestException('businessId is required');
    this.assertAccess(businessId, user);

    const business = await this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      include: { businessType: true },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (!usesSharedCatalog(business) || !business.businessTypeId) {
      throw new BadRequestException(
        'Store type does not use a shared catalog',
      );
    }

    const catalog = await this.prisma.product.findMany({
      where: {
        businessTypeId: business.businessTypeId,
        businessId: null,
        deletedAt: null,
        isAvailable: true,
      },
      select: { id: true, defaultPrice: true, price: true },
    });

    let created = 0;
    let skipped = 0;
    for (const product of catalog) {
      const existing = await this.prisma.businessProductOffer.findFirst({
        where: {
          businessId,
          productId: product.id,
        },
      });
      if (existing) {
        if (existing.deletedAt) {
          await this.prisma.businessProductOffer.update({
            where: { id: existing.id },
            data: {
              deletedAt: null,
              isListed: true,
              isAvailable: true,
              price: existing.price ?? product.defaultPrice ?? product.price,
            },
          });
          created += 1;
        } else {
          skipped += 1;
        }
        continue;
      }
      await this.prisma.businessProductOffer.create({
        data: {
          businessId,
          productId: product.id,
          price: product.defaultPrice ?? product.price,
          isAvailable: true,
          isListed: true,
        },
      });
      created += 1;
    }

    await this.audit.log({
      userId: user.sub,
      action: 'enroll_catalog',
      entity: 'business',
      entityId: businessId,
      metadata: { created, skipped, catalogSize: catalog.length },
    });
    return { created, skipped, catalogSize: catalog.length };
  }

  async listOffers(businessId: string, user: JwtPayload) {
    this.assertAccess(businessId, user);
    const rows = await this.prisma.businessProductOffer.findMany({
      where: { businessId, deletedAt: null },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            productCategory: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((o) => ({
      id: o.id,
      businessId: o.businessId,
      productId: o.productId,
      price: o.price != null ? Number(o.price) : null,
      comparePrice: o.comparePrice != null ? Number(o.comparePrice) : null,
      isAvailable: o.isAvailable,
      isListed: o.isListed,
      product: this.mapProduct(o.product),
    }));
  }

  async updateOffer(offerId: string, dto: UpdateOfferDto, user: JwtPayload) {
    const offer = await this.prisma.businessProductOffer.findFirst({
      where: { id: offerId, deletedAt: null },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    this.assertAccess(offer.businessId, user);

    const updated = await this.prisma.businessProductOffer.update({
      where: { id: offerId },
      data: {
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.comparePrice !== undefined && { comparePrice: dto.comparePrice }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        ...(dto.isListed !== undefined && { isListed: dto.isListed }),
      },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            productCategory: true,
          },
        },
      },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'update',
      entity: 'business_product_offer',
      entityId: offerId,
      metadata: dto,
    });
    return {
      id: updated.id,
      businessId: updated.businessId,
      productId: updated.productId,
      price: updated.price != null ? Number(updated.price) : null,
      comparePrice:
        updated.comparePrice != null ? Number(updated.comparePrice) : null,
      isAvailable: updated.isAvailable,
      isListed: updated.isListed,
      product: this.mapProduct(updated.product),
    };
  }

  private async resolveBusinessTypeId(
    businessTypeId?: string,
    typeSlug?: string,
  ): Promise<string> {
    if (businessTypeId) return businessTypeId;
    if (!typeSlug) {
      throw new BadRequestException('businessTypeId or type is required');
    }
    const bt = await this.prisma.businessType.findFirst({
      where: { slug: typeSlug, deletedAt: null },
      select: { id: true },
    });
    if (!bt) throw new NotFoundException('Business type not found');
    return bt.id;
  }

  private async isSharedProductSlugTaken(
    businessTypeId: string,
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const row = await this.prisma.product.findFirst({
      where: {
        businessTypeId,
        businessId: null,
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
    return !!row;
  }

  private async assertTypeProductCategory(
    productCategoryId: string,
    businessTypeId: string,
  ) {
    const cat = await this.prisma.productCategory.findFirst({
      where: {
        id: productCategoryId,
        deletedAt: null,
        isActive: true,
        businessTypeId,
        businessId: null,
      },
    });
    if (!cat) throw new NotFoundException('Store category not found');
  }

  private async isProductSlugTaken(
    businessId: string,
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    // Unique index is on (businessId, slug) for all rows, including soft-deleted.
    const row = await this.prisma.product.findFirst({
      where: {
        businessId,
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
    return !!row;
  }

  private assertAdmin(user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) {
      return;
    }
    throw new ForbiddenException();
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
    business: {
      kind: BusinessKind;
      businessTypeId?: string | null;
      businessType?: {
        slug?: string | null;
        menuMode?: string | null;
      } | null;
    },
    dishCategoryId?: string | null,
    productCategoryId?: string | null,
  ) {
    if (isRestaurantKind(business)) {
      if (productCategoryId) {
        throw new BadRequestException(
          'GLOBAL_DISH verticals use global dish categories only',
        );
      }
      if (!dishCategoryId) {
        throw new BadRequestException(
          'Dish category is required for GLOBAL_DISH menu items',
        );
      }
      return;
    }
    if (isStoreKind(business)) {
      if (dishCategoryId) {
        throw new BadRequestException(
          'OWN_CATEGORIES verticals use their own product categories only',
        );
      }
      if (!productCategoryId) {
        throw new BadRequestException(
          'Store category is required for OWN_CATEGORIES products',
        );
      }
    }
  }

  /** Type-scoped category preferred; legacy same-business rows still allowed. */
  private async assertStoreProductCategory(
    productCategoryId: string,
    business: {
      id: string;
      businessTypeId?: string | null;
    },
  ) {
    const or: Array<{
      businessTypeId?: string;
      businessId?: string | null;
    }> = [{ businessId: business.id }];
    if (business.businessTypeId) {
      or.unshift({
        businessTypeId: business.businessTypeId,
        businessId: null,
      });
    }
    const cat = await this.prisma.productCategory.findFirst({
      where: {
        id: productCategoryId,
        deletedAt: null,
        isActive: true,
        OR: or,
      },
    });
    if (!cat) throw new NotFoundException('Store category not found');
  }
}
