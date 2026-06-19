import { Injectable } from '@nestjs/common';
import { AdminNotificationType, Prisma } from '@prisma/client';
import { notificationRetentionCutoff } from '../../common/utils/notification-retention.util';
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

  notifyCourierDeclined(params: {
    orderId: string;
    orderNumber: string;
    courierName?: string;
    reason?: string;
  }) {
    return this.create({
      type: AdminNotificationType.COURIER_DECLINED,
      title: 'Courier declined order',
      body: `${params.courierName ?? 'Courier'} declined order ${params.orderNumber}`,
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        reason: params.reason,
      },
    });
  }

  notifyOrderDelivered(order: {
    id: string;
    orderNumber: string;
    businessName?: string | null;
  }) {
    return this.create({
      type: AdminNotificationType.ORDER_DELIVERED,
      title: 'Order delivered',
      body: `Order ${order.orderNumber} from ${order.businessName ?? 'merchant'} was delivered`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
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

  private freshAdminNotificationWhere(): Prisma.AdminNotificationWhereInput {
    return { createdAt: { gte: notificationRetentionCutoff() } };
  }

  private schedulePurgeExpiredNotifications() {
    void this.purgeExpiredNotifications().catch(() => undefined);
  }

  async purgeExpiredNotifications() {
    await this.prisma.adminNotification.deleteMany({
      where: { createdAt: { lt: notificationRetentionCutoff() } },
    });
  }

  async listForUser(userId: string, limit = 30) {
    this.schedulePurgeExpiredNotifications();
    const notifications = await this.prisma.adminNotification.findMany({
      where: this.freshAdminNotificationWhere(),
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
      where: {
        ...this.freshAdminNotificationWhere(),
        reads: { none: { userId } },
      },
    });
    return { count };
  }

  async markRead(notificationId: string, userId: string) {
    const row = await this.prisma.adminNotification.findFirst({
      where: { id: notificationId, ...this.freshAdminNotificationWhere() },
      select: { id: true },
    });
    if (!row) return { ok: true };

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
      where: {
        ...this.freshAdminNotificationWhere(),
        reads: { none: { userId } },
      },
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
