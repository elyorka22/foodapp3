abstract final class AppRoutes {
  static const splash = '/';
  static const restaurants = '/restaurants';
  static const allRestaurants = '/restaurants/all';
  static const stores = '/stores';
  static const cart = '/cart';
  static const profile = '/profile';
  static const profileHelp = '/profile/help';
  static const profilePartnership = '/profile/partnership';
  static const checkout = '/checkout';
  static const checkoutDelivery = '/checkout/delivery';
  static const completeProfile = '/complete-profile';
  static const orderTrack = '/track';
  static const notifications = '/notifications';
  static const promotions = '/promotions';
  static const booking = '/booking';
  static const networkHealth = '/network-health';
  static const categoryProductsBase = '/categories';
  static String categoryProducts(String slug) => '$categoryProductsBase/$slug';
}
