import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_framing.dart';
import '../../core/utils/image_url.dart';
import '../../core/utils/restaurant_card_meta.dart';
import '../../shared/models/restaurant_model.dart';

/// Wide Yandex-style restaurant row for the full restaurants list.
class RestaurantListCard extends StatelessWidget {
  const RestaurantListCard({
    super.key,
    required this.restaurant,
    required this.onTap,
  });

  final RestaurantModel restaurant;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final delivery = restaurantDeliveryLabel(restaurant);
    final rating = restaurant.averageRating;
    final minOrder = restaurant.minOrderAmount;
    String? minLabel;
    if (minOrder != null) {
      minLabel = AppStrings.orderFromAmount(minOrder.round().toString());
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AspectRatio(
            aspectRatio: 16 / 10,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: _cover(),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      restaurant.name.toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.subtitle.copyWith(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.directions_walk, size: 15, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            [
                              delivery,
                              if (minLabel != null) minLabel,
                            ].join(' · '),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (rating != null) ...[
                const SizedBox(width: 8),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, size: 14, color: Color(0xFFFBBF24)),
                    const SizedBox(width: 2),
                    Text(
                      rating.toStringAsFixed(1).replaceAll('.', ','),
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ],
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
          errorWidget: (_, __, ___) => _placeholder(),
        ),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() {
    return ColoredBox(
      color: const Color(0xFF3F3F46),
      child: Center(
        child: Text(
          restaurant.name.isNotEmpty ? restaurant.name[0].toUpperCase() : 'R',
          style: AppTypography.display.copyWith(
            color: Colors.white.withValues(alpha: 0.35),
            fontSize: 48,
          ),
        ),
      ),
    );
  }
}
