import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import 'dashboard_model.dart';

class DashboardRepository {
  DashboardRepository(this._dio);

  final Dio _dio;

  /// `GET /analytics/dashboard`
  Future<DashboardMetrics> fetchDashboard() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.analyticsDashboard);
    final data = res.data ?? <String, dynamic>{};
    return DashboardMetrics.fromJson(data);
  }
}

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository(ref.watch(dioProvider));
});
