abstract final class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const notifications = '/notifications';

  static const restaurantHome = '/restaurant';
  static const restaurantHistory = '/restaurant/history';
  static const restaurantMenu = '/restaurant/menu';
  static const restaurantStats = '/restaurant/stats';
  static const restaurantProfile = '/restaurant/profile';
  static String restaurantOrderDetail(String id) => '/restaurant/orders/$id';

  static const managerHome = '/manager';
  static const managerRestaurants = '/manager/restaurants';
  static const managerStores = '/manager/stores';
  static const managerCouriers = '/manager/couriers';
  static const managerProfile = '/manager/profile';

  static const managerRestaurantNew = '/manager/restaurants/new';
  static String managerRestaurantEdit(String id) => '/manager/restaurants/$id/edit';
  static String managerRestaurantMenu(String id) => '/manager/restaurants/$id/menu';
  static const productForm = '/product-form';
  static const managerCourierNew = '/manager/couriers/new';
}
