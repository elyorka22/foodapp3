import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { userBusinessId, resolveBusinessId } from '../../domain/business/business-id.util';
import { businessWhereForVertical } from '../../domain/business/merchant-vertical';
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
    const rows = await this.prisma.product.findMany({
      where: {
        businessId,
        deletedAt: null,
        ...(publicMenu && { isAvailable: true }),
        ...(categoryId && { productCategoryId: categoryId }),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productCategory: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
    }));
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
      ...(query.categoryId && { productCategoryId: query.categoryId }),
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
          business: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const mapped = data.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
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

    const product = await this.prisma.product.create({
      data: {
        businessId,
        productCategoryId: dto.productCategoryId ?? dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        comparePrice: dto.comparePrice,
        isAvailable: dto.isAvailable ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: {
        images: true,
        productCategory: true,
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
    return product;
  }

  async update(id: string, dto: Partial<CreateProductDto>, user: JwtPayload) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundException();
    this.assertAccess(existing.businessId, user);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.comparePrice !== undefined && { comparePrice: dto.comparePrice }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...((dto.productCategoryId ?? dto.categoryId) !== undefined && {
          productCategoryId: dto.productCategoryId ?? dto.categoryId,
        }),
      },
      include: {
        images: true,
        productCategory: true,
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
    return product;
  }

  async addImage(id: string, url: string, user: JwtPayload) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product || product.deletedAt) throw new NotFoundException();
    this.assertAccess(product.businessId, user);

    const isFirst = product.images.length === 0;
    return this.prisma.productImage.create({
      data: {
        productId: id,
        url,
        isPrimary: isFirst,
        sortOrder: product.images.length,
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

  private assertAccess(businessId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (userBusinessId(user) !== businessId) throw new ForbiddenException();
  }
}
