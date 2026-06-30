import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import '../../../core/utils/owner_login.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/models/working_hour_model.dart';

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

  Future<List<RestaurantModel>> fetchAllRestaurants({String? vertical}) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.restaurantsAdmin,
      queryParameters: {
        'limit': 100,
        if (vertical != null) 'vertical': vertical,
      },
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

  Future<void> updateTelegramChatId(String restaurantId, String? chatId) async {
    await _dio.patch(
      ApiPaths.restaurant(restaurantId),
      data: {'telegramOrderChatId': chatId},
    );
  }

  /// Create or update business panel owner without PATCH ownerLogin/ownerFullName
  /// (compatible with older API that only accepts ownerPassword on PATCH).
  Future<void> syncOwnerAccount({
    required String restaurantId,
    required String login,
    required String password,
    String? fullName,
  }) async {
    try {
      await _dio.post(
        ApiPaths.restaurantOwnerAccount(restaurantId),
        data: {
          'login': login,
          'password': password,
          if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
        },
      );
      return;
    } on DioException catch (e) {
      if (e.response?.statusCode != 404 && e.response?.statusCode != 405) {
        rethrow;
      }
    }

    await _createOwnerViaUsers(
      restaurantId: restaurantId,
      login: login,
      password: password,
      fullName: fullName,
    );
  }

  /// Password reset only — works on older API (ownerPassword on PATCH).
  Future<void> resetOwnerPassword(String restaurantId, String password) async {
    await _dio.patch(
      ApiPaths.restaurant(restaurantId),
      data: {'ownerPassword': password},
    );
  }

  Future<void> _createOwnerViaUsers({
    required String restaurantId,
    required String login,
    required String password,
    String? fullName,
  }) async {
    final parts = parseOwnerLogin(login);
    await _dio.post(
      ApiPaths.users,
      data: {
        'email': parts.email,
        if (parts.phone != null) 'phone': parts.phone,
        'password': password,
        'role': 'BUSINESS',
        'restaurantId': restaurantId,
        if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
      },
    );
  }

  Future<RestaurantStatsModel> fetchStats(String restaurantId) async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.restaurantStats(restaurantId));
    return RestaurantStatsModel.fromJson(res.data!);
  }

  Future<List<WorkingHourModel>> fetchWorkingHours(String restaurantId) async {
    final res = await _dio.get<List<dynamic>>(ApiPaths.restaurantWorkingHours(restaurantId));
    return (res.data ?? [])
        .whereType<Map<String, dynamic>>()
        .map(WorkingHourModel.fromJson)
        .toList();
  }
}
