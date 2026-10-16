import '../../../core/utils/json_parse.dart';

class AdminSettings {
  const AdminSettings({
    this.appName = '',
    this.homeTitle = '',
    this.homeSubtitle = '',
    this.homeRestaurantsBannerImageUrl = '',
    this.homeRestaurantsBannerTitle = '',
    this.supportPhone = '',
    this.supportTelegram = '',
    this.helpTelegramUrl = '',
    this.partnershipTelegramUrl = '',
    this.partnershipPhone = '',
    this.socialInstagramUrl = '',
    this.socialTelegramUrl = '',
    this.socialYoutubeUrl = '',
    this.supportEmail = '',
    this.minOrderAmount = 0,
    this.freeDeliveryThreshold = 0,
    this.defaultDeliveryFee = 0,
    this.commissionDefault = 0,
    this.courierDispatchMode = 'auto',
    this.bannerDefaultImageScale = 100,
    this.bannerDefaultImagePositionX = 50,
    this.bannerDefaultImagePositionY = 50,
    this.restaurantCardDefaultImageScale = 100,
    this.restaurantCardDefaultCoverPositionX = 50,
    this.restaurantCardDefaultCoverPositionY = 50,
  });

  final String appName;
  final String homeTitle;
  final String homeSubtitle;
  final String homeRestaurantsBannerImageUrl;
  final String homeRestaurantsBannerTitle;
  final String supportPhone;
  final String supportTelegram;
  final String helpTelegramUrl;
  final String partnershipTelegramUrl;
  final String partnershipPhone;
  final String socialInstagramUrl;
  final String socialTelegramUrl;
  final String socialYoutubeUrl;
  final String supportEmail;
  final num minOrderAmount;
  final num freeDeliveryThreshold;
  final num defaultDeliveryFee;
  final num commissionDefault;
  final String courierDispatchMode;
  final num bannerDefaultImageScale;
  final num bannerDefaultImagePositionX;
  final num bannerDefaultImagePositionY;
  final num restaurantCardDefaultImageScale;
  final num restaurantCardDefaultCoverPositionX;
  final num restaurantCardDefaultCoverPositionY;

  factory AdminSettings.fromJson(Map<String, dynamic> json) {
    return AdminSettings(
      appName: json['app_name'] as String? ?? '',
      homeTitle: json['home_title'] as String? ?? '',
      homeSubtitle: json['home_subtitle'] as String? ?? '',
      homeRestaurantsBannerImageUrl:
          json['home_restaurants_banner_image_url'] as String? ?? '',
      homeRestaurantsBannerTitle:
          json['home_restaurants_banner_title'] as String? ?? '',
      supportPhone: json['support_phone'] as String? ?? '',
      supportTelegram: json['support_telegram'] as String? ?? '',
      helpTelegramUrl: json['help_telegram_url'] as String? ?? '',
      partnershipTelegramUrl: json['partnership_telegram_url'] as String? ?? '',
      partnershipPhone: json['partnership_phone'] as String? ?? '',
      socialInstagramUrl: json['social_instagram_url'] as String? ?? '',
      socialTelegramUrl: json['social_telegram_url'] as String? ?? '',
      socialYoutubeUrl: json['social_youtube_url'] as String? ?? '',
      supportEmail: json['support_email'] as String? ?? '',
      minOrderAmount: parseNum(json['min_order_amount']),
      freeDeliveryThreshold: parseNum(json['free_delivery_threshold']),
      defaultDeliveryFee: parseNum(json['default_delivery_fee']),
      commissionDefault: parseNum(json['commission_default']),
      courierDispatchMode: json['courier_dispatch_mode'] as String? ?? 'auto',
      bannerDefaultImageScale: parseNum(json['banner_default_image_scale'], 100),
      bannerDefaultImagePositionX:
          parseNum(json['banner_default_image_position_x'], 50),
      bannerDefaultImagePositionY:
          parseNum(json['banner_default_image_position_y'], 50),
      restaurantCardDefaultImageScale:
          parseNum(json['restaurant_card_default_image_scale'], 100),
      restaurantCardDefaultCoverPositionX:
          parseNum(json['restaurant_card_default_cover_position_x'], 50),
      restaurantCardDefaultCoverPositionY:
          parseNum(json['restaurant_card_default_cover_position_y'], 50),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'app_name': appName,
      'home_title': homeTitle,
      'home_subtitle': homeSubtitle,
      'home_restaurants_banner_image_url': homeRestaurantsBannerImageUrl,
      'home_restaurants_banner_title': homeRestaurantsBannerTitle,
      'support_phone': supportPhone,
      'support_telegram': supportTelegram,
      'help_telegram_url': helpTelegramUrl,
      'partnership_telegram_url': partnershipTelegramUrl,
      'partnership_phone': partnershipPhone,
      'social_instagram_url': socialInstagramUrl,
      'social_telegram_url': socialTelegramUrl,
      'social_youtube_url': socialYoutubeUrl,
      'support_email': supportEmail,
      'min_order_amount': minOrderAmount,
      'free_delivery_threshold': freeDeliveryThreshold,
      'default_delivery_fee': defaultDeliveryFee,
      'commission_default': commissionDefault,
      'courier_dispatch_mode': courierDispatchMode,
      'banner_default_image_scale': bannerDefaultImageScale,
      'banner_default_image_position_x': bannerDefaultImagePositionX,
      'banner_default_image_position_y': bannerDefaultImagePositionY,
      'restaurant_card_default_image_scale': restaurantCardDefaultImageScale,
      'restaurant_card_default_cover_position_x':
          restaurantCardDefaultCoverPositionX,
      'restaurant_card_default_cover_position_y':
          restaurantCardDefaultCoverPositionY,
    };
  }
}
