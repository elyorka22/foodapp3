/// Paths relative to Nest API base (`…/api/v1`).
/// Only include endpoints that already exist on the backend.
abstract final class ApiPaths {
  /// Staff login — LoginDto: optional email OR phone + required password.
  static const authLogin = '/auth/login';

  /// Public Nest health check (no auth). Connectivity probe only.
  static const health = '/health';
  static const healthSystem = '/health/system';

  static const users = '/users';
  static String user(String id) => '/users/$id';

  /// Canonical merchant create/list (alias `/restaurants/*` still works).
  static const businesses = '/businesses';
  static const restaurantsAdmin = '/restaurants/admin';
  static String restaurant(String id) => '/restaurants/$id';
  static String restaurantApproval(String id) => '/restaurants/$id/approval';
  static String restaurantOwnerAccount(String id) =>
      '/restaurants/$id/owner-account';

  static const orders = '/orders';
  static String order(String id) => '/orders/$id';
  static String orderStatus(String id) => '/orders/$id/status';
  static String orderAssignCourier(String id) => '/orders/$id/assign-courier';
  static String orderReassignCourier(String id) =>
      '/orders/$id/reassign-courier';
  static String orderRemoveCourier(String id) => '/orders/$id/remove-courier';
  static String orderRequestCourier(String id) =>
      '/orders/$id/request-courier';

  static const couriers = '/couriers';
  static String courier(String id) => '/couriers/$id';
  static String courierStatus(String id) => '/couriers/$id/status';

  static const products = '/products';
  static const productsAdmin = '/products/admin';
  static String product(String id) => '/products/$id';
  static String productImage(String id) => '/products/$id/image';
  static const productsBulk = '/products/bulk';

  static const dishCategoriesAdmin = '/dish-categories/admin';
  static const dishCategories = '/dish-categories';
  static String dishCategory(String id) => '/dish-categories/$id';

  static const banners = '/banners';
  static const bannersAdmin = '/banners/admin';
  static const bannersReorder = '/banners/admin/reorder';
  static String banner(String id) => '/banners/$id';

  static const promoCodes = '/promo-codes';
  static String promoCode(String id) => '/promo-codes/$id';

  static const settings = '/settings';
  static const settingsAdmin = '/settings/admin';
  static const settingsDeliveryPricing = '/settings/delivery-pricing';

  static const audit = '/audit';
  static const analyticsDashboard = '/analytics/dashboard';

  static const pushSend = '/notifications/admin/push/send';

  static const cities = '/cities';
  static const citiesAdmin = '/cities/admin';
  static String city(String id) => '/cities/$id';

  static const deliveryZones = '/delivery-zones';
  static String deliveryZone(String id) => '/delivery-zones/$id';

  static const businessTypes = '/business-types';
  static const businessTypesAdmin = '/business-types/admin';
  static String businessType(String id) => '/business-types/$id';

  static const customersAdmin = '/customers/admin';
  static String customerStatus(String id) => '/customers/$id/status';

  static const bookingVenuesAdmin = '/booking/admin/venues';
  static String bookingVenue(String id) => '/booking/admin/venues/$id';
  static const bookingSlidesAdmin = '/booking/admin/slides';
  static String bookingSlide(String id) => '/booking/admin/slides/$id';


  static const uploadImage = '/upload/image';
}
