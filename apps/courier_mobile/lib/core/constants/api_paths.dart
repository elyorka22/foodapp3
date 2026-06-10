abstract final class ApiPaths {
  static const authLogin = '/auth/login';
  static const courierMe = '/couriers/me';
  static const courierOnline = '/couriers/me/online';
  static const courierLocation = '/couriers/location';
  static String courierDeclineOrder(String id) => '/couriers/orders/$id/decline';
  static const courierAvailableOrders = '/couriers/me/orders/available';
  static const courierEarnings = '/couriers/me/earnings';
  static const courierShiftStats = '/couriers/me/shift-stats';
  static const courierWeeklyStats = '/couriers/me/weekly-stats';
  static const orders = '/orders';
  static String order(String id) => '/orders/$id';
  static String orderAccept(String id) => '/orders/$id/accept';
  static String orderStatus(String id) => '/orders/$id/status';
  static const notificationsStaff = '/notifications/staff';
  static const notificationsStaffUnread = '/notifications/staff/unread-count';
  static String notificationStaffRead(String id) => '/notifications/staff/$id/read';
  static const notificationsStaffReadAll = '/notifications/staff/read-all';
  static const courierDevicesRegister = '/couriers/devices/register';
  static const courierDevicesUnregister = '/couriers/devices/unregister';
}
