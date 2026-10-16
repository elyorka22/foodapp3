import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';

class ControlCustomer {
  const ControlCustomer({
    required this.id,
    required this.isActive,
    this.fullName,
    this.phone,
    this.email,
  });

  final String id;
  final bool isActive;
  final String? fullName;
  final String? phone;
  final String? email;

  String get displayName {
    if (fullName != null && fullName!.isNotEmpty) return fullName!;
    if (phone != null && phone!.isNotEmpty) return phone!;
    return id;
  }

  factory ControlCustomer.fromJson(Map<String, dynamic> json) {
    return ControlCustomer(
      id: json['id'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      fullName: json['fullName'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
    );
  }
}

class CustomersRepository {
  CustomersRepository(this._dio);
  final Dio _dio;

  Future<PaginatedResponse<ControlCustomer>> fetchCustomers({
    int page = 1,
    int limit = 40,
  }) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.customersAdmin,
      queryParameters: {'page': page, 'limit': limit},
    );
    return paginatedFromFlexibleJson(res.data, ControlCustomer.fromJson);
  }

  Future<void> updateStatus(String id, {required bool isActive}) async {
    await _dio.patch<dynamic>(
      ApiPaths.customerStatus(id),
      data: {'isActive': isActive},
    );
  }
}

final customersRepositoryProvider = Provider<CustomersRepository>((ref) {
  return CustomersRepository(ref.watch(dioProvider));
});
