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
    this.helpTelegramUrl = '',
    this.helpTelegramLabel = '',
    this.partnershipTelegramUrl = '',
    this.partnershipTelegramLabel = '',
    this.partnershipPhone = '',
  });

  final String appName;
  final String homeTitle;
  final String homeSubtitle;
  final String homeRestaurantsBannerImageUrl;
  final String homeRestaurantsBannerTitle;
  final String socialInstagramUrl;
  final String socialTelegramUrl;
  final String socialYoutubeUrl;
  final String helpTelegramUrl;
  final String helpTelegramLabel;
  final String partnershipTelegramUrl;
  final String partnershipTelegramLabel;
  final String partnershipPhone;

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
      helpTelegramUrl: json['help_telegram_url'] as String? ?? '',
      helpTelegramLabel: json['help_telegram_label'] as String? ?? '',
      partnershipTelegramUrl: json['partnership_telegram_url'] as String? ?? '',
      partnershipTelegramLabel: json['partnership_telegram_label'] as String? ?? '',
      partnershipPhone: json['partnership_phone'] as String? ?? '',
    );
  }
}

final publicSettingsProvider = FutureProvider<PublicSettings>((ref) async {
  final dio = ref.watch(dioProvider);
  final res = await dio.get<Map<String, dynamic>>('/settings/public');
  return PublicSettings.fromJson(res.data ?? {});
});
