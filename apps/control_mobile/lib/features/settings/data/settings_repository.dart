import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import 'settings_model.dart';

class SettingsRepository {
  SettingsRepository(this._dio);

  final Dio _dio;

  /// `GET /settings/admin`
  Future<AdminSettings> fetchAdminSettings() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.settingsAdmin);
    return AdminSettings.fromJson(res.data ?? <String, dynamic>{});
  }

  /// `PUT /settings/admin`
  Future<AdminSettings> updateAdminSettings(AdminSettings settings) async {
    final res = await _dio.put<Map<String, dynamic>>(
      ApiPaths.settingsAdmin,
      data: settings.toJson(),
    );
    return AdminSettings.fromJson(res.data ?? <String, dynamic>{});
  }
}

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.watch(dioProvider));
});
