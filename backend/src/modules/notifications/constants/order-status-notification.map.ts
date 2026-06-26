import { NotificationChannelCode, OrderStatus } from '@prisma/client';

/**
 * Customer push/in-app notifications — only 3 lifecycle messages:
 * 1. Order accepted or cancelled
 * 2. Courier picked up the order
 * 3. Thank you after delivery
 */
export const ORDER_STATUS_TO_CUSTOMER_TEMPLATE: Partial<
  Record<OrderStatus, NotificationChannelCode>
> = {
  [OrderStatus.ACCEPTED]: NotificationChannelCode.ORDER_ACCEPTED,
  [OrderStatus.CANCELLED]: NotificationChannelCode.ORDER_CANCELLED,
  [OrderStatus.PICKED_UP]: NotificationChannelCode.ORDER_DELIVERING,
  [OrderStatus.DELIVERED]: NotificationChannelCode.ORDER_COMPLETED,
};
