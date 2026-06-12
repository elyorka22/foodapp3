import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/models/restaurant_model.dart';

final restaurantRepositoryProvider = Provider<RestaurantRepository>((ref) {
  return RestaurantRepository(ref.watch(dioProvider));
});

class RestaurantRepository {
  RestaurantRepository(this._dio);

  final Dio _dio;

  Future<RestaurantModel?> fetchMyRestaurant() async {
    final res = await _dio.get<dynamic>(ApiPaths.restaurantsAdmin);
    final list = parseListResponse(res.data);
    if (list.isEmpty) return null;
    return RestaurantModel.fromJson(list.first);
  }

  Future<List<RestaurantModel>> fetchAllRestaurants() async {
    final res = await _dio.get<dynamic>(
      ApiPaths.restaurantsAdmin,
      queryParameters: {'limit': 100},
    );
    return parseListResponse(res.data).map(RestaurantModel.fromJson).toList();
  }

  Future<RestaurantModel> fetchRestaurant(String id) async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.restaurant(id));
    return RestaurantModel.fromJson(res.data!);
  }

  Future<RestaurantModel> createRestaurant(RestaurantModel restaurant) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.restaurants,
      data: restaurant.toCreateJson(),
    );
    return RestaurantModel.fromJson(res.data!);
  }

  Future<RestaurantModel> updateRestaurant(RestaurantModel restaurant) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.restaurant(restaurant.id),
      data: restaurant.toUpdateJson(),
    );
    return RestaurantModel.fromJson(res.data!);
  }

  Future<RestaurantStatsModel> fetchStats(String restaurantId) async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.restaurantStats(restaurantId));
    return RestaurantStatsModel.fromJson(res.data!);
  }
}
