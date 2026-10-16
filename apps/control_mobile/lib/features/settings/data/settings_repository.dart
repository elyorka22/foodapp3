import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import 'delivery_pricing_model.dart';
import 'settings_model.dart';

class SettingsRepository {
  SettingsRepository(this._dio);

  final Dio _dio;

  Future<AdminSettings> fetchAdminSettings() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.settingsAdmin);
    return AdminSettings.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<AdminSettings> updateAdminSettings(AdminSettings settings) async {
    final res = await _dio.put<Map<String, dynamic>>(
      ApiPaths.settingsAdmin,
      data: settings.toJson(),
    );
    return AdminSettings.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<DeliveryPricing> fetchDeliveryPricing() async {
    final res =
        await _dio.get<Map<String, dynamic>>(ApiPaths.settingsDeliveryPricing);
    return DeliveryPricing.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<DeliveryPricing> updateDeliveryPricing(DeliveryPricing pricing) async {
    final res = await _dio.put<Map<String, dynamic>>(
      ApiPaths.settingsDeliveryPricing,
      data: pricing.toJson(),
    );
    return DeliveryPricing.fromJson(res.data ?? <String, dynamic>{});
  }
}

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.watch(dioProvider));
});
