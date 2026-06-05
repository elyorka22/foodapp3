import { Injectable, NotFoundException } from '@nestjs/common';
import {
  NotificationAccountType,
  NotificationChannelCode,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PushDeliveryService } from './push/push-delivery.service';
import { NotificationsGateway } from './notifications.gateway';

export type SendNotificationParams = {
  userId: string;
  accountType: NotificationAccountType;
  templateCode: string;
  metadata?: Record<string, unknown>;
  titleOverride?: string;
  bodyOverride?: string;
};

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private pushDelivery: PushDeliveryService,
    private gateway: NotificationsGateway,
  ) {}

  async sendToUser(params: SendNotificationParams) {
    const notification = await this.createFromTemplate(params);
    if (!notification) return null;
    await this.pushDelivery.deliverNotification({
      userId: params.userId,
      accountType: params.accountType,
      notificationId: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: params.metadata,
    });
    this.gateway.emitToRecipient(params.userId, params.accountType, notification);
    return notification;
  }

  async sendToMany(
    recipients: { userId: string; accountType: NotificationAccountType }[],
    templateCode: string,
    metadata?: Record<string, unknown>,
  ) {
    const results = await Promise.all(
      recipients.map((r) =>
        this.sendToUser({
          userId: r.userId,
          accountType: r.accountType,
          templateCode,
          metadata,
        }),
      ),
    );
    return results;
  }

  private async createFromTemplate(params: SendNotificationParams) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { code: params.templateCode },
    });
    if (!template) {
      throw new NotFoundException(`Notification template ${params.templateCode} not found`);
    }

    const enabled = await this.isTypeEnabled(
      params.userId,
      params.accountType,
      template.type,
    );
    if (!enabled) {
      return null;
    }

    const title = params.titleOverride ?? this.interpolate(template.title, params.metadata);
    const body = params.bodyOverride ?? this.interpolate(template.body, params.metadata);

    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        accountType: params.accountType,
        title,
        body,
        type: template.type,
        metadata: params.metadata as Prisma.InputJsonValue,
      },
    });
  }

  private interpolate(text: string, metadata?: Record<string, unknown>): string {
    if (!metadata) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const val = metadata[key];
      return val != null ? String(val) : '';
    });
  }

  private async isTypeEnabled(
    userId: string,
    accountType: NotificationAccountType,
    type: NotificationChannelCode,
  ): Promise<boolean> {
    const pref = await this.prisma.notificationPreference.findUnique({
      where: {
        userId_accountType_type: { userId, accountType, type },
      },
    });
    return pref?.enabled ?? true;
  }

  async getUserNotifications(
    userId: string,
    accountType: NotificationAccountType,
    limit = 50,
    cursor?: string,
  ) {
    return this.prisma.notification.findMany({
      where: { userId, accountType },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });
  }

  async getUnreadCount(userId: string, accountType: NotificationAccountType) {
    const count = await this.prisma.notification.count({
      where: { userId, accountType, isRead: false },
    });
    return { count };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
    accountType: NotificationAccountType,
  ) {
    const row = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId, accountType },
    });
    if (!row) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string, accountType: NotificationAccountType) {
    await this.prisma.notification.updateMany({
      where: { userId, accountType, isRead: false },
      data: { isRead: true },
    });
    return { ok: true };
  }

  /** Customer order status change — backend-only entry point. */
  async notifyCustomerOrderStatus(params: {
    customerId: string;
    templateCode: string;
    metadata?: Record<string, unknown>;
    titleOverride?: string;
    bodyOverride?: string;
  }) {
    return this.sendToUser({
      userId: params.customerId,
      accountType: NotificationAccountType.CUSTOMER,
      templateCode: params.templateCode,
      metadata: params.metadata,
      titleOverride: params.titleOverride,
      bodyOverride: params.bodyOverride,
    });
  }

  /** Staff / manager / courier — same FoodApp notification store. */
  async notifyStaff(params: {
    userId: string;
    templateCode: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.sendToUser({
      userId: params.userId,
      accountType: NotificationAccountType.STAFF,
      templateCode: params.templateCode,
      metadata: params.metadata,
    });
  }

  async notifyManagersNewOrder(order: {
    id: string;
    orderNumber: string;
    businessName?: string;
  }) {
    const managers = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        role: { in: ['SUPER_ADMIN', 'MANAGER'] },
      },
      select: { id: true },
    });
    const metadata = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      businessName: order.businessName,
    };
    await this.sendToMany(
      managers.map((m) => ({
        userId: m.id,
        accountType: NotificationAccountType.STAFF,
      })),
      'NEW_ORDER',
      metadata,
    );
  }

  async notifyCourierAssigned(params: {
    courierUserId: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.notifyStaff({
      userId: params.courierUserId,
      templateCode: 'ORDER_ASSIGNED',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    });
  }

  async notifyManagersCourierDeclined(params: {
    orderId: string;
    orderNumber: string;
    courierName?: string;
    reason?: string;
  }) {
    const managers = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        role: { in: ['SUPER_ADMIN', 'MANAGER'] },
      },
      select: { id: true },
    });
    const metadata = {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      courierName: params.courierName,
      reason: params.reason,
    };
    await this.sendToMany(
      managers.map((m) => ({
        userId: m.id,
        accountType: NotificationAccountType.STAFF,
      })),
      'ORDER_PROBLEM',
      metadata,
    );
  }
}
