import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayOrders, pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      this.prisma.order.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } }),
      this.prisma.order.count({ where: { deletedAt: null, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { deletedAt: null, status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { deletedAt: null, status: OrderStatus.CANCELLED } }),
    ]);

    const [revenueTodayAgg, revenueMonthAgg, activeCouriers, activeRestaurants] = await Promise.all([
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
      this.prisma.restaurant.count({ where: { isActive: true, deletedAt: null } }),
    ]);

    const recentOrdersRaw = await this.prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        guestOrder: true,
        restaurant: { select: { name: true } },
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
      recentOrders: recentOrdersRaw.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt,
        restaurant: o.restaurant,
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
        this.prisma.restaurant.count({ where: { isActive: true, deletedAt: null } }),
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

  async getRestaurantStats(restaurantId: string) {
    const [orders, revenue] = await Promise.all([
      this.prisma.order.count({ where: { restaurantId, deletedAt: null } }),
      this.prisma.order.aggregate({
        where: { restaurantId, status: OrderStatus.DELIVERED, deletedAt: null },
        _sum: { subtotal: true },
      }),
    ]);

    return {
      totalOrders: orders,
      revenue: Number(revenue._sum.subtotal ?? 0),
    };
  }
}
