import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import 'courier_model.dart';

class CouriersRepository {
  CouriersRepository(this._dio);

  final Dio _dio;

  Future<PaginatedResponse<ControlCourier>> fetchCouriers({
    int page = 1,
    int limit = 50,
    bool? isActive,
  }) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.couriers,
      queryParameters: {
        'page': page,
        'limit': limit,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return paginatedFromFlexibleJson(res.data, ControlCourier.fromJson);
  }

  Future<ControlCourier> createCourier({
    required String fullName,
    required String phone,
    required String password,
    String? email,
    String? vehicleType,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.couriers,
      data: {
        'fullName': fullName,
        'phone': phone,
        'password': password,
        if (email != null && email.isNotEmpty) 'email': email,
        if (vehicleType != null && vehicleType.isNotEmpty)
          'vehicleType': vehicleType,
      },
    );
    return ControlCourier.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> updateCourier(
    String id, {
    String? fullName,
    String? phone,
    String? email,
    String? vehicleType,
  }) async {
    await _dio.patch<dynamic>(
      ApiPaths.courier(id),
      data: {
        if (fullName != null) 'fullName': fullName,
        if (phone != null) 'phone': phone,
        if (email != null) 'email': email,
        if (vehicleType != null) 'vehicleType': vehicleType,
      },
    );
  }

  Future<void> updateStatus(
    String id, {
    bool? isActive,
    bool? isOnline,
  }) async {
    await _dio.patch<dynamic>(
      ApiPaths.courierStatus(id),
      data: {
        if (isActive != null) 'isActive': isActive,
        if (isOnline != null) 'isOnline': isOnline,
      },
    );
  }
}

final couriersRepositoryProvider = Provider<CouriersRepository>((ref) {
  return CouriersRepository(ref.watch(dioProvider));
});
