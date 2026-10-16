/// Paths relative to Nest API base (`…/api/v1`).
/// Only include endpoints that already exist on the backend.
abstract final class ApiPaths {
  /// Staff login — LoginDto: optional email OR phone + required password.
  static const authLogin = '/auth/login';

  /// Public Nest health check (no auth). Connectivity probe only.
  static const health = '/health';

  // Prepared for later integration (existing admin APIs). Not called in step 1.
  static const users = '/users';
  static const restaurantsAdmin = '/restaurants/admin';
  static const orders = '/orders';
  static const productsAdmin = '/products/admin';
  static const dishCategoriesAdmin = '/dish-categories/admin';
  static const banners = '/banners';
  static const promoCodes = '/promo-codes';
  static const settings = '/settings';
  static const audit = '/audit';
  static const analyticsDashboard = '/analytics/dashboard';
}
