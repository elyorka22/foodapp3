abstract final class ApiPaths {
  static const authLogin = '/auth/login';
  static const orders = '/orders';
  static const restaurantsAdmin = '/restaurants/admin';
  static const couriers = '/couriers';
  static String orderStatus(String id) => '/orders/$id/status';
  static String requestCourier(String id) => '/orders/$id/request-courier';
  static String assignCourier(String id) => '/orders/$id/assign-courier';
  static String restaurantStats(String id) => '/analytics/restaurant/$id';
}
