import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/banner_model.dart';
import '../../../shared/models/paginated_response.dart';
import '../../../shared/models/restaurant_model.dart';

final restaurantsRepositoryProvider = Provider<RestaurantsRepository>((ref) {
  return RestaurantsRepository(ref.watch(dioProvider));
});

class RestaurantsRepository {
  RestaurantsRepository(this._dio);

  final Dio _dio;

  Future<List<BannerModel>> fetchBanners() async {
    final res = await _dio.get<List<dynamic>>(ApiPaths.banners);
    return (res.data ?? [])
        .whereType<Map>()
        .map((e) => BannerModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<List<RestaurantModel>> fetchRestaurants({String? search}) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.restaurants,
      queryParameters: {
        'limit': 50,
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
    return PaginatedResponse.fromJson(
      res.data!,
      RestaurantModel.fromJson,
    ).data;
  }

  Future<RestaurantModel> fetchRestaurantDetail(String slugOrId) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.restaurantDetail(slugOrId),
    );
    return RestaurantModel.fromJson(res.data!);
  }

  Future<List<ProductModel>> fetchProducts(String restaurantId) async {
    final res = await _dio.get<List<dynamic>>(
      ApiPaths.productsByRestaurant(restaurantId),
    );
    return (res.data ?? [])
        .whereType<Map>()
        .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<List<ProductCategoryModel>> fetchCategories(String businessId) async {
    final res = await _dio.get<List<dynamic>>(
      ApiPaths.categoriesByBusiness(businessId),
    );
    return (res.data ?? [])
        .whereType<Map>()
        .map((e) => ProductCategoryModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
}
