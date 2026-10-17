abstract final class ApiPaths {
  static const authLogin = '/auth/login';
  static const orders = '/orders';
  static const restaurants = '/restaurants';
  static const restaurantsAdmin = '/restaurants/admin';
  static const couriers = '/couriers';
  static const productsAdmin = '/products/admin';
  static const products = '/products';
  static const categories = '/categories';
  static const uploadImage = '/upload/image';
  static const courierDispatch = '/settings/courier-dispatch';
  static const notificationsStaff = '/notifications/staff';
  static const notificationsStaffUnread = '/notifications/staff/unread-count';
  static const notificationsStaffReadAll = '/notifications/staff/read-all';
  static const staffDevicesRegister = '/notifications/staff/devices/register';
  static const staffDevicesUnregister = '/notifications/staff/devices/unregister';
  static String notificationStaffRead(String id) => '/notifications/staff/$id/read';

  static const users = '/users';

  static String order(String id) => '/orders/$id';
  static String orderStatus(String id) => '/orders/$id/status';
  static String requestCourier(String id) => '/orders/$id/request-courier';
  static String assignCourier(String id) => '/orders/$id/assign-courier';
  static String reassignCourier(String id) => '/orders/$id/reassign-courier';
  static String removeCourier(String id) => '/orders/$id/remove-courier';
  static String restaurant(String id) => '/restaurants/$id';
  static String restaurantOwnerAccount(String id) => '/restaurants/$id/owner-account';
  static String restaurantWorkingHours(String id) => '/restaurants/$id/working-hours';
  static String restaurantStats(String id) => '/analytics/restaurant/$id';
  static String product(String id) => '/products/$id';
  static String productImage(String id) => '/products/$id/image';
  static String courier(String id) => '/couriers/$id';
  static String courierStatus(String id) => '/couriers/$id/status';
}
