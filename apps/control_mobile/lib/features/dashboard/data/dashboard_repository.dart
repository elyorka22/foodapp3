import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';

/// Prepared API integration for dashboard metrics.
/// Not called from the UI until PostgreSQL / analytics endpoints are available.
class DashboardRepository {
  DashboardRepository(this._dio);

  final Dio _dio;

  /// Existing backend path (when authorized + DB connected):
  /// `GET /analytics/dashboard`
  Future<Map<String, dynamic>> fetchDashboard() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.analyticsDashboard);
    return res.data ?? <String, dynamic>{};
  }
}

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.watch(dioProvider));
});
