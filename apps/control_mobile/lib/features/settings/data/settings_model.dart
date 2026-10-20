import '../../../core/utils/json_parse.dart';
import 'home_service_card_model.dart';

class AdminSettings {
  const AdminSettings({
    this.appName = '',
    this.homeTitle = '',
    this.homeSubtitle = '',
    this.homeRestaurantsBannerImageUrl = '',
    this.homeRestaurantsBannerTitle = '',
    this.supportPhone = '',
    this.partnershipPhone = '',
    this.socialInstagramUrl = '',
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
    this.homeServiceCards = HomeServiceCards.defaults,
  });

  final String appName;
  final String homeTitle;
  final String homeSubtitle;
  final String homeRestaurantsBannerImageUrl;
  final String homeRestaurantsBannerTitle;
  final String supportPhone;
  final String partnershipPhone;
  final String socialInstagramUrl;
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
  final HomeServiceCards homeServiceCards;

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
      partnershipPhone: json['partnership_phone'] as String? ?? '',
      socialInstagramUrl: json['social_instagram_url'] as String? ?? '',
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
      homeServiceCards:
          HomeServiceCards.fromJson(json['home_service_cards']),
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
      'partnership_phone': partnershipPhone,
      'social_instagram_url': socialInstagramUrl,
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
      'home_service_cards': homeServiceCards.toJson(),
    };
  }

  AdminSettings copyWith({
    String? appName,
    String? homeTitle,
    String? homeSubtitle,
    String? homeRestaurantsBannerImageUrl,
    String? homeRestaurantsBannerTitle,
    String? supportPhone,
    String? partnershipPhone,
    String? socialInstagramUrl,
    String? socialYoutubeUrl,
    String? supportEmail,
    num? minOrderAmount,
    num? freeDeliveryThreshold,
    num? defaultDeliveryFee,
    num? commissionDefault,
    String? courierDispatchMode,
    num? bannerDefaultImageScale,
    num? bannerDefaultImagePositionX,
    num? bannerDefaultImagePositionY,
    num? restaurantCardDefaultImageScale,
    num? restaurantCardDefaultCoverPositionX,
    num? restaurantCardDefaultCoverPositionY,
    HomeServiceCards? homeServiceCards,
  }) {
    return AdminSettings(
      appName: appName ?? this.appName,
      homeTitle: homeTitle ?? this.homeTitle,
      homeSubtitle: homeSubtitle ?? this.homeSubtitle,
      homeRestaurantsBannerImageUrl:
          homeRestaurantsBannerImageUrl ?? this.homeRestaurantsBannerImageUrl,
      homeRestaurantsBannerTitle:
          homeRestaurantsBannerTitle ?? this.homeRestaurantsBannerTitle,
      supportPhone: supportPhone ?? this.supportPhone,
      partnershipPhone: partnershipPhone ?? this.partnershipPhone,
      socialInstagramUrl: socialInstagramUrl ?? this.socialInstagramUrl,
      socialYoutubeUrl: socialYoutubeUrl ?? this.socialYoutubeUrl,
      supportEmail: supportEmail ?? this.supportEmail,
      minOrderAmount: minOrderAmount ?? this.minOrderAmount,
      freeDeliveryThreshold:
          freeDeliveryThreshold ?? this.freeDeliveryThreshold,
      defaultDeliveryFee: defaultDeliveryFee ?? this.defaultDeliveryFee,
      commissionDefault: commissionDefault ?? this.commissionDefault,
      courierDispatchMode: courierDispatchMode ?? this.courierDispatchMode,
      bannerDefaultImageScale:
          bannerDefaultImageScale ?? this.bannerDefaultImageScale,
      bannerDefaultImagePositionX:
          bannerDefaultImagePositionX ?? this.bannerDefaultImagePositionX,
      bannerDefaultImagePositionY:
          bannerDefaultImagePositionY ?? this.bannerDefaultImagePositionY,
      restaurantCardDefaultImageScale: restaurantCardDefaultImageScale ??
          this.restaurantCardDefaultImageScale,
      restaurantCardDefaultCoverPositionX:
          restaurantCardDefaultCoverPositionX ??
              this.restaurantCardDefaultCoverPositionX,
      restaurantCardDefaultCoverPositionY:
          restaurantCardDefaultCoverPositionY ??
              this.restaurantCardDefaultCoverPositionY,
      homeServiceCards: homeServiceCards ?? this.homeServiceCards,
    );
  }
}
