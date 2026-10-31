import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../../core/utils/restaurant_card_meta.dart';
import '../models/restaurant_model.dart';
import 'home_section_header.dart';

const _fallbacks = [
  Color(0xFF3F3F46),
  Color(0xFF52525B),
  Color(0xFF27272A),
  Color(0xFF1C1917),
];

/// Matches web `home-restaurants-carousel.tsx`.
class HomeRestaurantsCarousel extends StatelessWidget {
  const HomeRestaurantsCarousel({
    super.key,
    required this.restaurants,
    this.isLoading = false,
    this.total,
  });

  final List<RestaurantModel> restaurants;
  final bool isLoading;
  final int? total;

  @override
  Widget build(BuildContext context) {
    if (!isLoading && restaurants.isEmpty) return const SizedBox.shrink();

    final count = total ?? restaurants.length;
    final cardWidth = (MediaQuery.sizeOf(context).width * 0.52 - 6)
        .clamp(176.0, 196.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        HomeSectionHeader(
          title: AppStrings.restaurants,
          count: count,
          onSeeAll: () => context.push(AppRoutes.allRestaurants),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: cardWidth / (5 / 4) + 72,
          child: isLoading
              ? ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: 3,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, __) => _Skeleton(width: cardWidth),
                )
              : ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: restaurants.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    return _RestaurantCard(
                      restaurant: restaurants[index],
                      index: index,
                      width: cardWidth,
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _RestaurantCard extends StatelessWidget {
  const _RestaurantCard({
    required this.restaurant,
    required this.index,
    required this.width,
  });

  final RestaurantModel restaurant;
  final int index;
  final double width;

  @override
  Widget build(BuildContext context) {
    final imageUrl = resolveImageUrl(restaurant.coverUrl ?? restaurant.logoUrl);
    final delivery = restaurantDeliveryLabel(restaurant);
    final ratingLabel = restaurant.averageRating
        ?.toStringAsFixed(1)
        .replaceAll('.', ',');
    final minOrder = restaurant.minOrderAmount;
    String? minLabel;
    if (minOrder != null && minOrder >= 0) {
      final amount = NumberFormat('#,###', 'uz_UZ').format(minOrder.round());
      minLabel = AppStrings.orderFromAmount(amount);
    }

    return GestureDetector(
      onTap: () => context.go('/restaurants/${restaurant.slug}'),
      child: SizedBox(
        width: width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 5 / 4,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius:
                      BorderRadius.circular(AppSpacing.restaurantCardRadius),
                  border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
                ),
                clipBehavior: Clip.antiAlias,
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) =>
                            _Fallback(name: restaurant.name, index: index),
                      )
                    : _Fallback(name: restaurant.name, index: index),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    restaurant.name.toUpperCase(),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.subtitle.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                      height: 1.15,
                    ),
                  ),
                ),
                if (ratingLabel != null) ...[
                  const SizedBox(width: 6),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star_rounded, size: 14, color: AppColors.star),
                      const SizedBox(width: 2),
                      Text(
                        ratingLabel,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(
                  Icons.directions_walk,
                  size: 14,
                  color: AppColors.textMuted,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    minLabel == null ? delivery : '$delivery · $minLabel',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Fallback extends StatelessWidget {
  const _Fallback({required this.name, required this.index});

  final String name;
  final int index;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: _fallbacks[index % _fallbacks.length],
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: AppTypography.display.copyWith(
            color: Colors.white.withValues(alpha: 0.4),
            fontSize: 40,
          ),
        ),
      ),
    );
  }
}

class _Skeleton extends StatelessWidget {
  const _Skeleton({required this.width});

  final double width;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 5 / 4,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.primarySoft,
                borderRadius:
                    BorderRadius.circular(AppSpacing.restaurantCardRadius),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Container(height: 14, width: 110, color: AppColors.primarySoft),
          const SizedBox(height: 6),
          Container(height: 12, width: 90, color: AppColors.primarySoft),
        ],
      ),
    );
  }
}
