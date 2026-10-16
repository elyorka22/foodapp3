import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import 'staff_user_model.dart';

class EmployeesRepository {
  EmployeesRepository(this._dio);

  final Dio _dio;

  /// `GET /users` — plain array or paginated envelope.
  Future<PaginatedResponse<StaffUser>> fetchUsers({
    String? role,
  }) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.users,
      queryParameters: role != null ? {'role': role} : null,
    );
    return paginatedFromFlexibleJson(
      res.data,
      StaffUser.fromJson,
    );
  }

  Future<StaffUser> createUser({
    required String email,
    required String password,
    required String role,
    String? fullName,
    String? phone,
    String? restaurantId,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.users,
      data: {
        'email': email,
        'password': password,
        'role': role,
        if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        if (restaurantId != null && restaurantId.isNotEmpty)
          'restaurantId': restaurantId,
      },
    );
    return StaffUser.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<StaffUser> updateUser(
    String id, {
    bool? isActive,
    String? password,
    String? fullName,
    String? phone,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.user(id),
      data: {
        if (isActive != null) 'isActive': isActive,
        if (password != null && password.isNotEmpty) 'password': password,
        if (fullName != null) 'fullName': fullName,
        if (phone != null) 'phone': phone,
      },
    );
    return StaffUser.fromJson(res.data ?? <String, dynamic>{});
  }
}

final employeesRepositoryProvider = Provider<EmployeesRepository>((ref) {
  return EmployeesRepository(ref.watch(dioProvider));
});
