import 'package:flutter/material.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/image_url.dart';
import '../models/banner_model.dart';
import '../models/business_model.dart';
import 'banner_slot_carousel.dart';
import 'home_store_slot_carousel.dart';

class HomeBannerGrid extends StatelessWidget {
  const HomeBannerGrid({
    super.key,
    required this.banners,
    this.featuredStores = const [],
  });

  final List<BannerModel> banners;
  final List<BusinessModel> featuredStores;

  List<BannerModel> _list(String placement) {
    return banners
        .where((b) => (b.placement ?? 'HERO') == placement && resolveImageUrl(b.imageUrl) != null)
        .toList();
  }

  List<BannerModel> get _legacyHero {
    return banners.where((b) {
      final p = b.placement ?? 'HERO';
      return (p == 'HERO' || p == 'PROMO') && resolveImageUrl(b.imageUrl) != null;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final mainList = _list('HOME_MAIN');
    final topList = _list('HOME_SIDE_TOP');

    final mainBanners = mainList.isNotEmpty ? mainList : _legacyHero;
    final topBanners = topList;
    final hasStores = featuredStores.isNotEmpty;

    if (mainBanners.isEmpty && topBanners.isEmpty && !hasStores) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 280,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            flex: 1,
            child: BannerSlotCarousel(banners: mainBanners, tall: true),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            flex: 1,
            child: Column(
              children: [
                Expanded(
                  child: BannerSlotCarousel(
                    banners: topBanners,
                    defaultRoute: AppRoutes.booking,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Expanded(
                  child: HomeStoreSlotCarousel(stores: featuredStores),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
