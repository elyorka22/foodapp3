import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.watch(dioProvider));
});

class SettingsRepository {
  SettingsRepository(this._dio);

  final Dio _dio;

  Future<String> fetchCourierDispatchMode() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.courierDispatch);
    return res.data?['mode'] as String? ?? 'auto';
  }
}
