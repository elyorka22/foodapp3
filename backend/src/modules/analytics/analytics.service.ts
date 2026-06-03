import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { businessWhereForVertical } from '../../domain/business/merchant-vertical';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayOrders, pendingOrders, deliveredOrders, cancelledOrders, topProducts, topRestaurants] =
      await Promise.all([
      this.prisma.order.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } }),
      this.prisma.order.count({ where: { deletedAt: null, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { deletedAt: null, status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { deletedAt: null, status: OrderStatus.CANCELLED } }),
      this.getTopProducts(5),
      this.getTopRestaurants(5),
    ]);

    const restaurantWhere = businessWhereForVertical('restaurant') ?? {};
    const storeWhere = businessWhereForVertical('store') ?? {};

    const [revenueTodayAgg, revenueMonthAgg, activeCouriers, activeRestaurants, activeStores] =
      await Promise.all([
      this.prisma.order.aggregate({
        where: {
          deletedAt: null,
          status: OrderStatus.DELIVERED,
          deliveredAt: { gte: startOfToday },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          deletedAt: null,
          status: OrderStatus.DELIVERED,
          deliveredAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      this.prisma.courier.count({ where: { isOnline: true, deletedAt: null } }),
      this.prisma.business.count({
        where: { isActive: true, deletedAt: null, ...restaurantWhere },
      }),
      this.prisma.business.count({
        where: { isActive: true, deletedAt: null, ...storeWhere },
      }),
    ]);

    const recentOrdersRaw = await this.prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        guestOrder: true,
        business: { select: { name: true } },
        courier: { include: { user: { select: { fullName: true } } } },
      },
    });

    const last30Start = new Date(startOfToday);
    last30Start.setDate(last30Start.getDate() - 29);

    // Use SQL aggregation for efficient charts.
    const revenueRows = (await this.prisma.$queryRaw<
      { day: Date; revenue: number }[]
    >`
      SELECT date_trunc('day', delivered_at) as day,
             COALESCE(SUM(total), 0)::float as revenue
      FROM orders
      WHERE deleted_at IS NULL
        AND status = 'DELIVERED'
        AND delivered_at >= ${last30Start}
      GROUP BY 1
      ORDER BY 1 ASC
    `) ?? [];

    const ordersRows = (await this.prisma.$queryRaw<
      { day: Date; count: number }[]
    >`
      SELECT date_trunc('day', created_at) as day,
             COUNT(*)::int as count
      FROM orders
      WHERE deleted_at IS NULL
        AND created_at >= ${last30Start}
      GROUP BY 1
      ORDER BY 1 ASC
    `) ?? [];

    // Fill missing days for the UI.
    const byDayRevenue = new Map(revenueRows.map((r) => [r.day.toISOString().slice(0, 10), r.revenue]));
    const byDayOrders = new Map(ordersRows.map((r) => [r.day.toISOString().slice(0, 10), r.count]));

    const revenueChart: { date: string; value: number }[] = [];
    const ordersChart: { date: string; value: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(last30Start);
      d.setDate(last30Start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      revenueChart.push({ date: key, value: Number(byDayRevenue.get(key) ?? 0) });
      ordersChart.push({ date: key, value: Number(byDayOrders.get(key) ?? 0) });
    }

    return {
      todayOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      revenueToday: Number(revenueTodayAgg._sum.total ?? 0),
      revenueMonth: Number(revenueMonthAgg._sum.total ?? 0),
      activeCouriers,
      activeRestaurants,
      activeStores,
      topProducts,
      topRestaurants,
      recentOrders: recentOrdersRaw.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt,
        business: o.business,
        restaurant: o.business,
        guestOrder: { phone: o.guestOrder.phone, deliveryAddress: o.guestOrder.deliveryAddress },
        courier: o.courier ? { fullName: o.courier.user.fullName } : null,
      })),
      revenueChart,
      ordersChart,
    };
  }

  async getGlobalStats() {
    const [totalOrders, deliveredOrders, totalRevenue, activeRestaurants, onlineCouriers] =
      await Promise.all([
        this.prisma.order.count({ where: { deletedAt: null } }),
        this.prisma.order.count({
          where: { status: OrderStatus.DELIVERED, deletedAt: null },
        }),
        this.prisma.order.aggregate({
          where: { status: OrderStatus.DELIVERED, deletedAt: null },
          _sum: { total: true, commissionAmount: true },
        }),
        this.prisma.business.count({ where: { isActive: true, deletedAt: null } }),
        this.prisma.courier.count({ where: { isOnline: true, deletedAt: null } }),
      ]);

    return {
      totalOrders,
      deliveredOrders,
      totalRevenue: Number(totalRevenue._sum.total ?? 0),
      platformCommission: Number(totalRevenue._sum.commissionAmount ?? 0),
      activeRestaurants,
      onlineCouriers,
    };
  }

  async getRestaurantStats(businessId: string) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseDelivered = {
      businessId,
      deletedAt: null,
      status: OrderStatus.DELIVERED,
    };

    const [revenueToday, revenueWeek, revenueMonth, ordersToday, ordersWeek, ordersMonth, topProducts] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: { ...baseDelivered, deliveredAt: { gte: startOfToday } },
          _sum: { subtotal: true },
          _count: { _all: true },
        }),
        this.prisma.order.aggregate({
          where: { ...baseDelivered, deliveredAt: { gte: startOfWeek } },
          _sum: { subtotal: true },
          _count: { _all: true },
        }),
        this.prisma.order.aggregate({
          where: { ...baseDelivered, deliveredAt: { gte: startOfMonth } },
          _sum: { subtotal: true },
          _count: { _all: true },
        }),
        this.prisma.order.count({
          where: { businessId, deletedAt: null, createdAt: { gte: startOfToday } },
        }),
        this.prisma.order.count({
          where: { businessId, deletedAt: null, createdAt: { gte: startOfWeek } },
        }),
        this.prisma.order.count({
          where: { businessId, deletedAt: null, createdAt: { gte: startOfMonth } },
        }),
        this.prisma.orderItem.groupBy({
          by: ['name'],
          where: {
            order: { businessId, deletedAt: null, status: OrderStatus.DELIVERED },
          },
          _sum: { quantity: true, subtotal: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
      ]);

    const revenueTodayVal = Number(revenueToday._sum.subtotal ?? 0);
    const deliveredToday = revenueToday._count._all;
    const averageOrderValue =
      deliveredToday > 0 ? revenueTodayVal / deliveredToday : 0;

    const last30Start = new Date(startOfToday);
    last30Start.setDate(last30Start.getDate() - 29);

    const revenueRows = (await this.prisma.$queryRaw<
      { day: Date; revenue: number }[]
    >`
      SELECT date_trunc('day', delivered_at) as day,
             COALESCE(SUM(subtotal), 0)::float as revenue
      FROM orders
      WHERE deleted_at IS NULL
        AND status = 'DELIVERED'
        AND restaurant_id = ${businessId}::uuid
        AND delivered_at >= ${last30Start}
      GROUP BY 1
      ORDER BY 1 ASC
    `) ?? [];

    const ordersRows = (await this.prisma.$queryRaw<
      { day: Date; count: number }[]
    >`
      SELECT date_trunc('day', created_at) as day,
             COUNT(*)::int as count
      FROM orders
      WHERE deleted_at IS NULL
        AND restaurant_id = ${businessId}::uuid
        AND created_at >= ${last30Start}
      GROUP BY 1
      ORDER BY 1 ASC
    `) ?? [];

    const byDayRevenue = new Map(revenueRows.map((r) => [r.day.toISOString().slice(0, 10), r.revenue]));
    const byDayOrders = new Map(ordersRows.map((r) => [r.day.toISOString().slice(0, 10), r.count]));

    const revenueChart: { date: string; value: number }[] = [];
    const ordersChart: { date: string; value: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(last30Start);
      d.setDate(last30Start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      revenueChart.push({ date: key, value: Number(byDayRevenue.get(key) ?? 0) });
      ordersChart.push({ date: key, value: Number(byDayOrders.get(key) ?? 0) });
    }

    return {
      revenueToday: revenueTodayVal,
      revenueWeek: Number(revenueWeek._sum.subtotal ?? 0),
      revenueMonth: Number(revenueMonth._sum.subtotal ?? 0),
      ordersToday,
      ordersWeek,
      ordersMonth,
      averageOrderValue,
      topProducts: topProducts.map((p) => ({
        name: p.name,
        quantity: Number(p._sum.quantity ?? 0),
        revenue: Number(p._sum.subtotal ?? 0),
      })),
      revenueChart,
      ordersChart,
      totalOrders: ordersMonth,
      revenue: Number(revenueMonth._sum.subtotal ?? 0),
    };
  }

  async getTopProducts(limit = 10) {
    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: { order: { deletedAt: null, status: OrderStatus.DELIVERED } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });
    return rows.map((r) => ({
      productId: r.productId,
      name: r.name,
      quantity: Number(r._sum.quantity ?? 0),
      revenue: Number(r._sum.subtotal ?? 0),
    }));
  }

  async getTopRestaurants(limit = 10) {
    const rows = await this.prisma.order.groupBy({
      by: ['businessId'],
      where: { deletedAt: null, status: OrderStatus.DELIVERED },
      _sum: { subtotal: true, total: true },
      _count: { _all: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: limit,
    });

    const restaurants = await this.prisma.business.findMany({
      where: { id: { in: rows.map((r) => r.businessId) } },
      select: { id: true, name: true, slug: true },
    });
    const nameById = new Map(restaurants.map((r) => [r.id, r]));

    return rows.map((r) => ({
      businessId: r.businessId,
      name: nameById.get(r.businessId)?.name ?? 'Unknown',
      slug: nameById.get(r.businessId)?.slug,
      orderCount: r._count._all,
      revenue: Number(r._sum.subtotal ?? 0),
    }));
  }
}
