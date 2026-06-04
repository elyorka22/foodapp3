import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/utils/image_url.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/models/restaurant_model.dart';
import 'food_app_card.dart';

class FoodAppRestaurantCard extends StatelessWidget {
  const FoodAppRestaurantCard({
    super.key,
    required this.restaurant,
    required this.onTap,
  });

  final RestaurantModel restaurant;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FoodAppCard(
      onTap: onTap,
      borderRadius: 24,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(24),
            ),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: _cover(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(restaurant.name, style: AppTypography.subtitle),
                if (restaurant.description != null &&
                    restaurant.description!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      restaurant.description!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.bodySmall,
                    ),
                  ),
                if (restaurant.minOrderAmount != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'Min: ${restaurant.minOrderAmount} UZS',
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

  Widget _cover() {
    final resolved = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
    if (resolved != null && resolved.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: resolved,
        fit: BoxFit.cover,
        errorWidget: (_, __, ___) => _placeholder(),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() {
    return Container(
      color: AppColors.primarySoft,
      alignment: Alignment.center,
      child: Text(
        restaurant.name.isNotEmpty ? restaurant.name[0].toUpperCase() : 'F',
        style: AppTypography.display.copyWith(color: AppColors.primary),
      ),
    );
  }
}
