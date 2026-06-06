import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'lucide_restaurant_icons.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_framing.dart';
import '../../core/utils/image_url.dart';
import '../../core/utils/restaurant_card_meta.dart';
import '../../shared/models/restaurant_model.dart';

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
    final delivery = restaurantDeliveryLabel(restaurant);
    final categories = restaurantCategoryLabel(restaurant);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 2 / 1,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: _cover(),
                  ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Material(
                      color: Colors.transparent,
                      elevation: 0,
                      shadowColor: Colors.transparent,
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: () {},
                        splashColor: Colors.white24,
                        highlightColor: Colors.white12,
                        child: const SizedBox(
                          width: 32,
                          height: 32,
                          child: Center(
                            child: LucideBookmarkIcon(
                              size: 17,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            Text(
              restaurant.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.subtitle.copyWith(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                const LucideFootprintsIcon(
                  size: 15,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  delivery,
                  style: AppTypography.bodySmall.copyWith(fontSize: 13),
                ),
                if (categories.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      categories,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.end,
                      style: AppTypography.caption.copyWith(fontSize: 13),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _cover() {
    final resolved = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
    if (resolved != null && resolved.isNotEmpty) {
      return applyImageFraming(
        imageScale: restaurant.coverScale,
        imagePositionX: restaurant.coverPositionX,
        imagePositionY: restaurant.coverPositionY,
        child: CachedNetworkImage(
          imageUrl: resolved,
          fit: BoxFit.cover,
          alignment: Alignment(
            ((restaurant.coverPositionX ?? 50) / 50) - 1,
            ((restaurant.coverPositionY ?? 50) / 50) - 1,
          ),
          errorWidget: (_, __, ___) => _placeholder(),
        ),
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
