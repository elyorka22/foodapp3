import { NotificationChannelCode, OrderStatus } from '@prisma/client';

/** Maps order lifecycle → customer notification template code. */
export const ORDER_STATUS_TO_CUSTOMER_TEMPLATE: Partial<
  Record<OrderStatus, NotificationChannelCode>
> = {
  [OrderStatus.PENDING]: NotificationChannelCode.ORDER_CREATED,
  [OrderStatus.ACCEPTED]: NotificationChannelCode.ORDER_ACCEPTED,
  [OrderStatus.PREPARING]: NotificationChannelCode.ORDER_PREPARING,
  [OrderStatus.COURIER_ASSIGNED]: NotificationChannelCode.ORDER_READY,
  [OrderStatus.ARRIVED_AT_RESTAURANT]: NotificationChannelCode.ORDER_PREPARING,
  [OrderStatus.PICKED_UP]: NotificationChannelCode.ORDER_DELIVERING,
  [OrderStatus.DELIVERING]: NotificationChannelCode.ORDER_DELIVERING,
  [OrderStatus.DELIVERED]: NotificationChannelCode.ORDER_COMPLETED,
  [OrderStatus.CANCELLED]: NotificationChannelCode.ORDER_CANCELLED,
};
