abstract final class AppRoutes {
  static const splash = '/';
  static const restaurants = '/restaurants';
  static const stores = '/stores';
  static const cart = '/cart';
  static const profile = '/profile';
  static const checkout = '/checkout';
  static const completeProfile = '/complete-profile';
  static const orderTrack = '/track';
  static const notifications = '/notifications';
  static const promotions = '/promotions';
  static const networkHealth = '/network-health';
  static String categoryProducts(String slug) => '/categories/$slug';
}
