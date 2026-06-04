import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/banner_model.dart';
import 'banner_slot_carousel.dart';

class HomeBannerGrid extends StatelessWidget {
  const HomeBannerGrid({super.key, required this.banners});

  final List<BannerModel> banners;

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

  Widget _bottomSlot(BuildContext context, List<BannerModel> bottomBanners) {
    if (bottomBanners.isNotEmpty) {
      return BannerSlotCarousel(
        banners: bottomBanners,
        defaultRoute: AppRoutes.stores,
      );
    }
    return Material(
      color: AppColors.border,
      borderRadius: BorderRadius.circular(24),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(AppRoutes.stores),
        child: Center(
          child: Text(
            AppStrings.navStores,
            style: AppTypography.subtitle.copyWith(color: AppColors.success),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mainList = _list('HOME_MAIN');
    final topList = _list('HOME_SIDE_TOP');
    final bottomList = _list('HOME_SIDE_BOTTOM');

    final mainBanners = mainList.isNotEmpty ? mainList : _legacyHero;
    final topBanners = topList;
    final bottomBanners = bottomList;

    if (mainBanners.isEmpty && topBanners.isEmpty && bottomBanners.isEmpty) {
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
                Expanded(child: BannerSlotCarousel(banners: topBanners)),
                const SizedBox(height: AppSpacing.sm),
                Expanded(child: _bottomSlot(context, bottomBanners)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
