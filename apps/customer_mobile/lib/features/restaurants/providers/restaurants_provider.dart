import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/banner_model.dart';
import '../../../shared/models/restaurant_model.dart';
import '../data/restaurants_repository.dart';

final bannersProvider = FutureProvider.autoDispose<List<BannerModel>>((ref) {
  return ref.watch(restaurantsRepositoryProvider).fetchBanners();
});

final restaurantsListProvider =
    FutureProvider.autoDispose.family<List<RestaurantModel>, String?>(
  (ref, search) {
    return ref.watch(restaurantsRepositoryProvider).fetchRestaurants(
          search: search,
        );
  },
);

final restaurantDetailProvider =
    FutureProvider.autoDispose.family<RestaurantModel, String>((ref, slug) {
  return ref.watch(restaurantsRepositoryProvider).fetchRestaurantDetail(slug);
});

final restaurantProductsProvider =
    FutureProvider.autoDispose.family<List<ProductModel>, String>(
  (ref, restaurantId) {
    return ref.watch(restaurantsRepositoryProvider).fetchProducts(restaurantId);
  },
);
