import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_framing.dart';
import '../../core/utils/image_url.dart';
import '../../core/utils/restaurant_card_meta.dart';
import '../../shared/models/restaurant_model.dart';

/// Full-bleed restaurant tile for 2-column home grids (image + overlay title + time pill).
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

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: AspectRatio(
          aspectRatio: 3 / 4,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(22),
            child: Stack(
              fit: StackFit.expand,
              children: [
                _cover(),
                Positioned(
                  top: 12,
                  left: 12,
                  right: 12,
                  child: Text(
                    restaurant.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.subtitle.copyWith(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      height: 1.15,
                      shadows: const [
                        Shadow(
                          color: Color(0x88000000),
                          blurRadius: 8,
                          offset: Offset(0, 1),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  left: 10,
                  bottom: 10,
                  child: Material(
                    color: Colors.white.withValues(alpha: 0.22),
                    shape: const CircleBorder(),
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: () {},
                      child: const SizedBox(
                        width: 34,
                        height: 34,
                        child: Icon(
                          Icons.favorite_border_rounded,
                          size: 18,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  right: 10,
                  bottom: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.35),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Text(
                      delivery,
                      style: AppTypography.caption.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
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
          width: double.infinity,
          height: double.infinity,
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
      color: AppColors.primary,
      alignment: Alignment.center,
      child: Text(
        restaurant.name.isNotEmpty ? restaurant.name[0].toUpperCase() : 'F',
        style: AppTypography.display.copyWith(
          color: Colors.white.withValues(alpha: 0.45),
          fontSize: 48,
        ),
      ),
    );
  }
}
