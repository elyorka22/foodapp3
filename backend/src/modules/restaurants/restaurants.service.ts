import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RestaurantScheduleService } from './restaurant-schedule.service';
import { OrderStatus, Prisma, RestaurantApprovalStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { paginate, paginatedResponse } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { AdminRestaurantsQueryDto } from './dto/admin-restaurants-query.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private adminNotifications: AdminNotificationsService,
    private schedule: RestaurantScheduleService,
  ) {}

  async findAllPublic(query: { page?: number; limit?: number; search?: string }) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.RestaurantWhereInput = {
      isActive: true,
      approvalStatus: RestaurantApprovalStatus.APPROVED,
      deletedAt: null,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          branches: { where: { isActive: true }, take: 1 },
          categories: {
            where: { isActive: true, deletedAt: null },
            select: { id: true, name: true, slug: true },
            orderBy: { sortOrder: 'asc' },
            take: 6,
          },
        },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        slug,
        isActive: true,
        approvalStatus: RestaurantApprovalStatus.APPROVED,
        deletedAt: null,
      },
      include: {
        branches: { where: { isActive: true } },
        categories: {
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
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    const isOpen = await this.schedule.isOpen(restaurant.id);
    const products = restaurant.products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
    }));
    return { ...restaurant, products, isOpen };
  }

  async findById(id: string, user?: JwtPayload) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(!user && {
          isActive: true,
          approvalStatus: RestaurantApprovalStatus.APPROVED,
        }),
      },
      include: {
        branches: { where: { deletedAt: null, ...(!user && { isActive: true }) } },
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (user) this.assertRestaurantAccess(id, user);
    return restaurant;
  }

  async findAllAdmin(query: AdminRestaurantsQueryDto, user: JwtPayload) {
    const { skip, take } = paginate(query.page, query.limit);
    const where: Prisma.RestaurantWhereInput = {
      deletedAt: null,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
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
      where.id = user.restaurantId;
    }

    const [rows, total] = await Promise.all([
      this.prisma.restaurant.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.restaurant.count({ where }),
    ]);

    const ids = rows.map((r) => r.id);
    if (!ids.length) {
      return paginatedResponse([], total, query.page ?? 1, query.limit ?? 20);
    }

    const [orderGroups, revenueGroups, productGroups] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['restaurantId'],
        where: { restaurantId: { in: ids }, deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.order.groupBy({
        by: ['restaurantId'],
        where: {
          restaurantId: { in: ids },
          deletedAt: null,
          status: OrderStatus.DELIVERED,
        },
        _sum: { total: true },
      }),
      this.prisma.product.groupBy({
        by: ['restaurantId'],
        where: { restaurantId: { in: ids }, deletedAt: null },
        _count: { _all: true },
      }),
    ]);

    const orderCountMap = new Map(orderGroups.map((g) => [g.restaurantId, g._count._all]));
    const revenueMap = new Map(
      revenueGroups.map((g) => [g.restaurantId, Number(g._sum.total ?? 0)]),
    );
    const productCountMap = new Map(productGroups.map((g) => [g.restaurantId, g._count._all]));

    const data = rows.map((r) => ({
      ...r,
      commissionRate: Number(r.commissionRate),
      ordersCount: orderCountMap.get(r.id) ?? 0,
      revenue: revenueMap.get(r.id) ?? 0,
      productsCount: productCountMap.get(r.id) ?? 0,
    }));

    return paginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async getStats(id: string, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const baseWhere: Prisma.OrderWhereInput = { restaurantId: id, deletedAt: null };

    const [totalOrders, completedOrders, cancelledOrders, revenueAgg, productsCount, latestOrders] =
      await Promise.all([
        this.prisma.order.count({ where: baseWhere }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.DELIVERED },
        }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.CANCELLED },
        }),
        this.prisma.order.aggregate({
          where: { ...baseWhere, status: OrderStatus.DELIVERED },
          _sum: { total: true },
        }),
        this.prisma.product.count({ where: { restaurantId: id, deletedAt: null } }),
        this.prisma.order.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { guestOrder: true },
        }),
      ]);

    const revenue = Number(revenueAgg._sum.total ?? 0);
    const averageOrderValue = completedOrders > 0 ? revenue / completedOrders : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      revenue,
      averageOrderValue,
      productsCount,
      latestOrders,
    };
  }

  async create(dto: CreateRestaurantDto, user?: JwtPayload) {
    const isAdmin =
      user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.MANAGER;
    const wantsActive = dto.isActive !== false;
    const publishOnSite = isAdmin && wantsActive;

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
        coverUrl: dto.coverUrl,
        coverPositionX: dto.coverPositionX ?? 50,
        coverPositionY: dto.coverPositionY ?? 50,
        phone: dto.phone,
        commissionRate: dto.commissionRate,
        approvalStatus: publishOnSite
          ? RestaurantApprovalStatus.APPROVED
          : RestaurantApprovalStatus.PENDING,
        isActive: publishOnSite ? true : (dto.isActive ?? false),
        approvedAt: publishOnSite ? new Date() : null,
      },
    });
    await this.audit.log({
      userId: user?.sub,
      action: 'create',
      entity: 'restaurant',
      entityId: restaurant.id,
      metadata: { name: restaurant.name, published: publishOnSite },
    });
    return restaurant;
  }

  async update(id: string, dto: UpdateRestaurantDto, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    const data: Prisma.RestaurantUpdateInput = { ...dto };
    if (dto.commissionRate !== undefined) {
      data.commissionRate = dto.commissionRate;
    }
    const restaurant = await this.prisma.restaurant.update({ where: { id }, data });
    await this.audit.log({
      userId: user.sub,
      action: 'update',
      entity: 'restaurant',
      entityId: id,
      metadata: dto,
    });
    return restaurant;
  }

  async updateApproval(
    id: string,
    status: RestaurantApprovalStatus,
    note: string | undefined,
    user: JwtPayload,
  ) {
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException();
    }
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const isApproved = status === RestaurantApprovalStatus.APPROVED;
    const updated = await this.prisma.restaurant.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvalNote: note,
        approvedAt: isApproved ? new Date() : null,
        isActive: isApproved ? true : status !== RestaurantApprovalStatus.REJECTED,
      },
    });

    await this.audit.log({
      userId: user.sub,
      action: 'approval_change',
      entity: 'restaurant',
      entityId: id,
      metadata: { status, note },
    });

    if (status === RestaurantApprovalStatus.SUSPENDED) {
      await this.adminNotifications.notifyRestaurantSuspended({
        id: restaurant.id,
        name: restaurant.name,
      });
    }

    return updated;
  }

  async getFinance(id: string, user: JwtPayload) {
    this.assertRestaurantAccess(id, user);
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const delivered = await this.prisma.order.aggregate({
      where: {
        restaurantId: id,
        deletedAt: null,
        status: OrderStatus.DELIVERED,
      },
      _sum: { subtotal: true, commissionAmount: true, total: true },
      _count: { _all: true },
    });

    const grossRevenue = Number(delivered._sum.subtotal ?? 0);
    const platformCommission = Number(delivered._sum.commissionAmount ?? 0);
    const netRestaurantRevenue = grossRevenue - platformCommission;

    return {
      restaurantId: id,
      restaurantName: restaurant.name,
      commissionRate: Number(restaurant.commissionRate),
      completedOrders: delivered._count._all,
      grossRevenue,
      platformCommission,
      netRestaurantRevenue,
      totalOrderValue: Number(delivered._sum.total ?? 0),
    };
  }

  async softDelete(id: string, user: JwtPayload) {
    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can delete restaurants');
    }
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    const deleted = await this.prisma.restaurant.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.audit.log({
      userId: user.sub,
      action: 'delete',
      entity: 'restaurant',
      entityId: id,
    });
    return deleted;
  }

  assertAccess(restaurantId: string, user: JwtPayload) {
    this.assertRestaurantAccess(restaurantId, user);
  }

  private assertRestaurantAccess(restaurantId: string, user: JwtPayload) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MANAGER) return;
    if (user.restaurantId !== restaurantId) throw new ForbiddenException();
  }
}
