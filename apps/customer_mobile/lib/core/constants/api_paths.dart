/// Backend route paths (api/v1 prefix applied by Dio baseUrl).
class ApiPaths {
  ApiPaths._();

  static const banners = '/banners';
  static const dishCategories = '/dish-categories';
  static const restaurants = '/restaurants';
  static const businesses = '/businesses';
  static const businessTypes = '/business-types';
  static const products = '/products';
  static const categories = '/categories';

  static const customersRegister = '/customers/register';
  static const customersLogin = '/customers/login';
  static const customersMe = '/customers/me';
  static const customersCompleteProfile = '/customers/complete-profile';

  static const notifications = '/notifications';
  static const notificationsUnread = '/notifications/unread-count';
  static const notificationsReadAll = '/notifications/read-all';
  static const notificationsDevices = '/notifications/devices/register';
  static const notificationsDevicesLegacy = '/notifications/devices';
  static const notificationsDevicesUnregister = '/notifications/devices/unregister';
  static String notificationRead(String id) => '/notifications/$id/read';

  static const authTelegram = '/auth/telegram';
  static const ordersGuest = '/orders/guest';
  static const ordersDeliveryQuote = '/orders/delivery-quote';
  static const promoCodesValidate = '/promo-codes/validate';

  static String orderTrack(String token) => '/orders/track/$token';

  static String restaurantDetail(String slugOrId) => '/restaurants/$slugOrId';
  static String businessDetail(String idOrSlug) => '/businesses/$idOrSlug';
  static String productsByRestaurant(String restaurantId) =>
      '/products?restaurantId=$restaurantId';
  static String categoriesByBusiness(String businessId) =>
      '/categories?businessId=$businessId';
}
