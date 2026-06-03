import { NotificationChannelCode } from '@prisma/client';

const ORDER_NOTIFICATION_TYPES: NotificationChannelCode[] = [
  NotificationChannelCode.ORDER_CREATED,
  NotificationChannelCode.ORDER_ACCEPTED,
  NotificationChannelCode.ORDER_PREPARING,
  NotificationChannelCode.ORDER_READY,
  NotificationChannelCode.ORDER_DELIVERING,
  NotificationChannelCode.ORDER_COMPLETED,
  NotificationChannelCode.ORDER_CANCELLED,
];

/** Client route for notification tap (web + mobile). */
export function resolveNotificationRoute(
  type: NotificationChannelCode,
  metadata?: Record<string, unknown>,
): string {
  if (ORDER_NOTIFICATION_TYPES.includes(type)) {
    const token = metadata?.trackingToken;
    if (typeof token === 'string' && token.length > 0) {
      return `/track/${token}`;
    }
    return '/notifications';
  }
  if (type === NotificationChannelCode.PROMOTION) {
    return '/promotions';
  }
  return '/notifications';
}

/** FCM data payload — all values must be strings (transport layer only). */
export function buildPushDataPayload(params: {
  notificationId: string;
  type: NotificationChannelCode;
  userId: string;
  accountType: string;
  metadata?: Record<string, unknown>;
}): Record<string, string> {
  const meta = params.metadata ?? {};
  const route = resolveNotificationRoute(params.type, meta);

  const data: Record<string, string> = {
    notificationId: params.notificationId,
    type: params.type,
    userId: params.userId,
    accountType: params.accountType,
    route,
  };

  if (meta.orderId != null) data.orderId = String(meta.orderId);
  if (meta.orderNumber != null) data.orderNumber = String(meta.orderNumber);
  if (meta.trackingToken != null) data.trackingToken = String(meta.trackingToken);

  return data;
}
