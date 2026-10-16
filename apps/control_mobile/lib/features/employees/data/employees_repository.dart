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
}

final employeesRepositoryProvider = Provider<EmployeesRepository>((ref) {
  return EmployeesRepository(ref.watch(dioProvider));
});
