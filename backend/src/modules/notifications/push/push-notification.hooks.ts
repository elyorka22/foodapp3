import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { NotificationService } from '../notifications.service';

/**
 * Domain push event hooks — in-app + FCM via NotificationService.
 */
@Injectable()
export class PushNotificationHooks {
  constructor(private readonly notifications: NotificationService) {}

  /** Customer: courier accepted the assigned order. */
  customerCourierAccepted(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
    trackingToken?: string;
  }) {
    return this.notifications.notifyCustomerOrderStatus({
      customerId: params.customerId,
      templateCode: 'COURIER_ACCEPTED',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        trackingToken: params.trackingToken,
      },
    });
  }

  /** Customer: courier assigned / order accepted for delivery pipeline. */
  customerOrderAssigned(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.notifications.notifyCustomerOrderStatus({
      customerId: params.customerId,
      templateCode: 'ORDER_ACCEPTED',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    });
  }

  /** Customer: courier picked up the order. */
  customerOrderPickedUp(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.notifications.notifyCustomerOrderStatus({
      customerId: params.customerId,
      templateCode: 'ORDER_DELIVERING',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    });
  }

  /** Customer: order delivered. */
  customerOrderDelivered(params: {
    customerId: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.notifications.notifyCustomerOrderStatus({
      customerId: params.customerId,
      templateCode: 'ORDER_COMPLETED',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    });
  }

  /** Courier: new order assigned. */
  courierNewOrderAssigned(params: {
    courierUserId: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.notifications.notifyCourierAssigned(params);
  }

  /** Courier: removed from order (manager reassignment or removal). */
  courierUnassigned(params: {
    courierUserId: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.notifications.notifyStaff({
      userId: params.courierUserId,
      userRole: UserRole.COURIER,
      templateCode: 'COURIER_UNASSIGNED',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    });
  }

  /** Courier: assigned order cancelled. */
  courierOrderCancelled(params: {
    courierUserId: string;
    orderId: string;
    orderNumber: string;
  }) {
    return this.notifications.notifyStaff({
      userId: params.courierUserId,
      userRole: UserRole.COURIER,
      templateCode: 'ORDER_CANCELLED',
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    });
  }

  /** Manager: courier declined an order. */
  managerCourierDeclined(params: {
    orderId: string;
    orderNumber: string;
    courierName?: string;
    reason?: string;
  }) {
    return this.notifications.notifyManagersCourierDeclined(params);
  }
}
