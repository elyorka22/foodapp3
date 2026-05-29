import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductsQueryDto } from './dto/admin-products-query.dto';
import { BulkProductAction, BulkProductsDto } from './dto/bulk-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findByRestaurant(restaurantId: string, categoryId?: string) {
    return this.prisma.product.findMany({
      where: {
        restaurantId,
        deletedAt: null,
        ...(categoryId && { categoryId }),
      },
      include: { images: true, category: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin(query: AdminProductsQueryDto, user: JwtPayload) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.restaurantId && { restaurantId: query.restaurantId }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.isAvailable !== undefined && { isAvailable: query.isAvailable }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    if (user.role === UserRole.RESTAURANT_OWNER || user.role === UserRole.RESTAURANT_STAFF) {
      if (!user.restaurantId) throw new ForbiddenException();
      where.restaurantId = user.restaurantId;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: true,
          restaurant: { select: { id: true, name: true, slug: true } },
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
    this.assertAccess(dto.restaurantId, user);
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        price: dto.price,
      },
      include: { images: true, category: true, restaurant: { select: { id: true, name: true } } },
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
    this.assertAccess(existing.restaurantId, user);
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: { images: true, category: true, restaurant: { select: { id: true, name: true } } },
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
    this.assertAccess(product.restaurantId, user);

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
      this.assertAccess(p.restaurantId, user);
    }

    if (dto.action === BulkProductAction.DELETE) {
      if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.RESTAURANT_OWNER) {
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
    this.assertAccess(existing.restaurantId, user);
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

  private assertAccess(restaurantId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (user.restaurantId !== restaurantId) throw new ForbiddenException();
  }
}
