import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import '../../../shared/models/order_model.dart';

final restaurantRepositoryProvider = Provider<RestaurantRepository>((ref) {
  return RestaurantRepository(ref.watch(dioProvider));
});

class RestaurantRepository {
  RestaurantRepository(this._dio);

  final Dio _dio;

  Future<RestaurantSummaryModel?> fetchMyRestaurant() async {
    final res = await _dio.get<dynamic>(ApiPaths.restaurantsAdmin);
    final list = parseListResponse(res.data);
    if (list.isEmpty) return null;
    return RestaurantSummaryModel.fromJson(list.first);
  }

  Future<RestaurantStatsModel?> fetchStats(String restaurantId) async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.restaurantStats(restaurantId));
    return RestaurantStatsModel.fromJson(res.data!);
  }
}
