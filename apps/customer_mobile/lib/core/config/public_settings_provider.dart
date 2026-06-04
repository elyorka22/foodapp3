import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';

class PublicSettings {
  const PublicSettings({
    required this.appName,
    required this.homeTitle,
    required this.homeSubtitle,
  });

  final String appName;
  final String homeTitle;
  final String homeSubtitle;

  factory PublicSettings.fromJson(Map<String, dynamic> json) {
    return PublicSettings(
      appName: json['app_name'] as String? ?? 'FoodApp',
      homeTitle: json['home_title'] as String? ?? 'FoodApp',
      homeSubtitle: json['home_subtitle'] as String? ?? '',
    );
  }
}

final publicSettingsProvider = FutureProvider<PublicSettings>((ref) async {
  final dio = ref.watch(dioProvider);
  final res = await dio.get<Map<String, dynamic>>('/settings/public');
  return PublicSettings.fromJson(res.data ?? {});
});
