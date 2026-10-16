import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import 'restaurant_model.dart';

class BusinessesRepository {
  BusinessesRepository(this._dio);

  final Dio _dio;

  /// `GET /restaurants/admin?page&limit`
  Future<PaginatedResponse<ControlRestaurant>> fetchRestaurants({
    int page = 1,
    int limit = 20,
    Map<String, dynamic>? query,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.restaurantsAdmin,
      queryParameters: {
        'page': page,
        'limit': limit,
        ...?query,
      },
    );
    return PaginatedResponse.fromJson(
      res.data ?? <String, dynamic>{},
      ControlRestaurant.fromJson,
    );
  }
}

final businessesRepositoryProvider = Provider<BusinessesRepository>((ref) {
  return BusinessesRepository(ref.watch(dioProvider));
});
