import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/models/business_model.dart';
import 'business_availability_badge.dart';
import 'food_app_card.dart';

class FoodAppStoreCard extends StatelessWidget {
  const FoodAppStoreCard({
    super.key,
    required this.store,
    required this.onTap,
  });

  final BusinessModel store;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FoodAppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(width: 72, height: 72, child: _logo()),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(store.name, style: AppTypography.subtitle),
                const SizedBox(height: 2),
                BusinessAvailabilityBadge(
                  isOpen: store.isOpen,
                  closesAt: store.closesAt,
                  closingSoon: store.closingSoon ?? false,
                  compact: true,
                ),
                if (store.businessType != null)
                  Text(store.businessType!.name, style: AppTypography.caption),
                if (store.averageRating != null && store.reviewCount != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      '★ ${store.averageRating} (${store.reviewCount})',
                      style: AppTypography.caption,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _logo() {
    final url = store.logoUrl ?? store.coverUrl;
    if (url != null && url.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        errorWidget: (_, __, ___) => _placeholder(),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() {
    return ColoredBox(
      color: AppColors.primarySoft,
      child: Center(
        child: Text(
          store.name.isNotEmpty ? store.name[0].toUpperCase() : 'D',
          style: AppTypography.title.copyWith(color: AppColors.primary),
        ),
      ),
    );
  }
}
