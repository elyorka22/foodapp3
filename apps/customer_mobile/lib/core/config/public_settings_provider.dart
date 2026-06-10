import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';

class PublicSettings {
  const PublicSettings({
    required this.appName,
    required this.homeTitle,
    required this.homeSubtitle,
    this.homeRestaurantsBannerImageUrl = '',
    this.homeRestaurantsBannerTitle = '',
    this.socialInstagramUrl = '',
    this.socialTelegramUrl = '',
    this.socialYoutubeUrl = '',
  });

  final String appName;
  final String homeTitle;
  final String homeSubtitle;
  final String homeRestaurantsBannerImageUrl;
  final String homeRestaurantsBannerTitle;
  final String socialInstagramUrl;
  final String socialTelegramUrl;
  final String socialYoutubeUrl;

  factory PublicSettings.fromJson(Map<String, dynamic> json) {
    return PublicSettings(
      appName: json['app_name'] as String? ?? 'Foodapp',
      homeTitle: json['home_title'] as String? ?? 'Foodapp',
      homeSubtitle: json['home_subtitle'] as String? ?? '',
      homeRestaurantsBannerImageUrl:
          json['home_restaurants_banner_image_url'] as String? ?? '',
      homeRestaurantsBannerTitle:
          json['home_restaurants_banner_title'] as String? ?? '',
      socialInstagramUrl: json['social_instagram_url'] as String? ?? '',
      socialTelegramUrl: json['social_telegram_url'] as String? ?? '',
      socialYoutubeUrl: json['social_youtube_url'] as String? ?? '',
    );
  }
}

final publicSettingsProvider = FutureProvider<PublicSettings>((ref) async {
  final dio = ref.watch(dioProvider);
  final res = await dio.get<Map<String, dynamic>>('/settings/public');
  return PublicSettings.fromJson(res.data ?? {});
});
