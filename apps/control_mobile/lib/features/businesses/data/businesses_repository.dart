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

  /// `POST /businesses`
  Future<ControlRestaurant> createRestaurant({
    required String name,
    required String cityId,
    required String businessTypeId,
    String? phone,
    String? description,
    String? branchAddress,
    double? latitude,
    double? longitude,
    String? logoUrl,
    num? commissionRate,
    bool isActive = true,
    String? ownerLogin,
    String? ownerPassword,
    String? ownerFullName,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.businesses,
      data: {
        'name': name,
        'cityId': cityId,
        'businessTypeId': businessTypeId,
        'isActive': isActive,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        if (description != null && description.isNotEmpty)
          'description': description,
        if (branchAddress != null && branchAddress.isNotEmpty)
          'branchAddress': branchAddress,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (logoUrl != null && logoUrl.isNotEmpty) 'logoUrl': logoUrl,
        if (commissionRate != null) 'commissionRate': commissionRate,
        if (ownerLogin != null &&
            ownerLogin.isNotEmpty &&
            ownerPassword != null &&
            ownerPassword.isNotEmpty) ...{
          'ownerLogin': ownerLogin,
          'ownerPassword': ownerPassword,
          if (ownerFullName != null && ownerFullName.isNotEmpty)
            'ownerFullName': ownerFullName,
        },
      },
    );
    return ControlRestaurant.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlRestaurant> updateRestaurant(
    String id, {
    String? name,
    String? phone,
    String? branchAddress,
    String? cityId,
    bool? isActive,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.restaurant(id),
      data: {
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (branchAddress != null) 'branchAddress': branchAddress,
        if (cityId != null) 'cityId': cityId,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return ControlRestaurant.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> updateApproval(
    String id, {
    required String status,
    String? note,
  }) async {
    await _dio.patch<dynamic>(
      ApiPaths.restaurantApproval(id),
      data: {
        'status': status,
        if (note != null && note.isNotEmpty) 'note': note,
      },
    );
  }

  Future<void> createOwnerAccount(
    String id, {
    required String login,
    required String password,
    String? fullName,
  }) async {
    await _dio.post<dynamic>(
      ApiPaths.restaurantOwnerAccount(id),
      data: {
        'login': login,
        'password': password,
        if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
      },
    );
  }
}

final businessesRepositoryProvider = Provider<BusinessesRepository>((ref) {
  return BusinessesRepository(ref.watch(dioProvider));
});
