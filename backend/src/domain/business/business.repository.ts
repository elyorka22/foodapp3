import { Injectable } from '@nestjs/common';
import { BusinessApprovalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { toBusinessPublicDto } from './business.mapper';
import { businessWhereForVertical } from './merchant-vertical';

/**
 * Data access for merchants. Maps Prisma `Business` model (DB table: restaurants).
 * New modules must depend on this repository, not RestaurantsService.
 */
@Injectable()
export class BusinessRepository {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.business.findFirst({
      where: { id, deletedAt: null },
      include: {
        businessType: true,
        branches: { where: { isActive: true } },
        productCategories: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { isAvailable: true, deletedAt: null },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.business.findFirst({
      where: {
        slug,
        isActive: true,
        approvalStatus: BusinessApprovalStatus.APPROVED,
        deletedAt: null,
      },
      include: {
        businessType: true,
        branches: { where: { isActive: true } },
        productCategories: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { isAvailable: true, deletedAt: null },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findAllPublic(query: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    excludeType?: string;
    vertical?: 'restaurant' | 'store';
    sort?: 'popular' | 'nearest' | 'rating' | 'fastest';
  }) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.BusinessWhereInput = {
      isActive: true,
      approvalStatus: BusinessApprovalStatus.APPROVED,
      deletedAt: null,
    };

    if (query.type) {
      where.businessType = { slug: query.type, isActive: true };
    } else if (query.vertical) {
      const verticalFilter = businessWhereForVertical(query.vertical);
      if (verticalFilter) Object.assign(where, verticalFilter);
    } else if (query.excludeType === 'restaurant') {
      const storeFilter = businessWhereForVertical('store');
      if (storeFilter) Object.assign(where, storeFilter);
    } else if (query.excludeType) {
      where.NOT = { businessType: { slug: query.excludeType } };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        {
          products: {
            some: {
              deletedAt: null,
              isAvailable: true,
              name: { contains: q, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    let orderBy: Prisma.BusinessOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'rating') orderBy = { averageRating: 'desc' };
    else if (query.sort === 'fastest') orderBy = { avgPrepMinutes: 'asc' };
    else if (query.sort === 'popular') orderBy = { reviewCount: 'desc' };

    const [rows, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          businessType: true,
          branches: { where: { isActive: true }, take: 1 },
          productCategories: {
            where: { isActive: true, deletedAt: null },
            select: { id: true, name: true, slug: true },
            orderBy: { sortOrder: 'asc' },
            take: 6,
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    return { rows, total, page: query.page ?? 1, limit: query.limit ?? 20 };
  }

  serializePublicList(
    rows: Parameters<typeof toBusinessPublicDto>[0][],
  ) {
    return rows.map((r) => toBusinessPublicDto(r));
  }
}
