import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import 'audit_model.dart';

class AuditRepository {
  AuditRepository(this._dio);

  final Dio _dio;

  /// `GET /audit?page&limit`
  Future<PaginatedResponse<AuditLogEntry>> fetchAuditLogs({
    int page = 1,
    int limit = 30,
    Map<String, dynamic>? query,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.audit,
      queryParameters: {
        'page': page,
        'limit': limit,
        ...?query,
      },
    );
    return PaginatedResponse.fromJson(
      res.data ?? <String, dynamic>{},
      AuditLogEntry.fromJson,
    );
  }
}

final auditRepositoryProvider = Provider<AuditRepository>((ref) {
  return AuditRepository(ref.watch(dioProvider));
});
