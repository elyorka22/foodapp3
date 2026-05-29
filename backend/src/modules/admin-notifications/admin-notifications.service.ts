import { Injectable } from '@nestjs/common';
import { AdminNotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminNotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(params: {
    type: AdminNotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        body: params.body,
        metadata: params.metadata as Prisma.InputJsonValue,
      },
    });
  }

  notifyNewOrder(order: { id: string; orderNumber: string; restaurant?: { name?: string } }) {
    return this.create({
      type: AdminNotificationType.NEW_ORDER,
      title: 'New order',
      body: `Order ${order.orderNumber} from ${order.restaurant?.name ?? 'restaurant'}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });
  }

  notifyCourierOffline(courier: { id: string; name: string }) {
    return this.create({
      type: AdminNotificationType.COURIER_OFFLINE,
      title: 'Courier went offline',
      body: `${courier.name} is now offline`,
      metadata: { courierId: courier.id },
    });
  }

  notifyRestaurantSuspended(restaurant: { id: string; name: string }) {
    return this.create({
      type: AdminNotificationType.RESTAURANT_SUSPENDED,
      title: 'Restaurant suspended',
      body: `${restaurant.name} has been suspended`,
      metadata: { restaurantId: restaurant.id },
    });
  }

  notifyCustomerBlocked(customer: { id: string; name: string }) {
    return this.create({
      type: AdminNotificationType.CUSTOMER_BLOCKED,
      title: 'Customer blocked',
      body: `${customer.name} was blocked`,
      metadata: { customerId: customer.id },
    });
  }

  async listForUser(userId: string, limit = 30) {
    const notifications = await this.prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        reads: { where: { userId }, select: { id: true } },
      },
    });

    return notifications.map((n) => ({
      ...n,
      isRead: n.reads.length > 0,
    }));
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.adminNotification.count({
      where: { reads: { none: { userId } } },
    });
    return { count };
  }

  async markRead(notificationId: string, userId: string) {
    await this.prisma.adminNotificationRead.upsert({
      where: {
        notificationId_userId: { notificationId, userId },
      },
      create: { notificationId, userId },
      update: { readAt: new Date() },
    });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    const unread = await this.prisma.adminNotification.findMany({
      where: { reads: { none: { userId } } },
      select: { id: true },
    });
    if (unread.length) {
      await this.prisma.adminNotificationRead.createMany({
        data: unread.map((n) => ({ notificationId: n.id, userId })),
        skipDuplicates: true,
      });
    }
    return { ok: true };
  }
}
