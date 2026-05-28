import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

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
