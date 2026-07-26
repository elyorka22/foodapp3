import 'package:flutter/material.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/business_kind.dart';
import '../../core/utils/image_url.dart';
import '../models/banner_model.dart';
import '../models/business_model.dart';
import 'banner_slot_carousel.dart';

/// Full-width store promo carousel above dish categories.
/// Hidden when no product stores exist or there are no store banners.
class HomeStoreBannersCarousel extends StatelessWidget {
  const HomeStoreBannersCarousel({
    super.key,
    required this.banners,
    required this.stores,
  });

  final List<BannerModel> banners;
  final List<BusinessModel> stores;

  List<BannerModel> _storeBanners() {
    final storeList = filterStoreBusinesses(
      stores,
      kindOf: (s) => s.kind,
      typeSlugOf: (s) => s.businessType?.slug,
    );
    if (storeList.isEmpty) return const [];

    final storeIds = storeList.map((s) => s.id).toSet();
    final list = banners.where((b) {
      if (resolveImageUrl(b.imageUrl) == null) return false;
      final placement = b.placement ?? 'HERO';
      if (placement == 'HOME_SIDE_BOTTOM') return true;
      final rid = b.restaurantId;
      return rid != null && storeIds.contains(rid);
    }).toList()
      ..sort((a, b) => (a.sortOrder ?? 0).compareTo(b.sortOrder ?? 0));
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final storeBanners = _storeBanners();
    if (storeBanners.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md),
      child: SizedBox(
        height: 140,
        child: BannerSlotCarousel(banners: storeBanners),
      ),
    );
  }
}
