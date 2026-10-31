import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class _ServiceTile {
  const _ServiceTile({
    required this.title,
    required this.eta,
    required this.route,
    required this.icon,
    this.imageUrl,
    this.badge,
    this.flex = 1,
  });

  final String title;
  final String eta;
  final String route;
  final IconData icon;
  final String? imageUrl;
  final String? badge;
  final int flex;
}

/// Yandex-style home service tiles (flowers / cosmetics / pharmacy / restaurants / grocery).
class HomeServiceGrid extends StatelessWidget {
  const HomeServiceGrid({super.key});

  static const _assetBase = 'https://foodapp.uz/assets/home-services';

  @override
  Widget build(BuildContext context) {
    const top = [
      _ServiceTile(
        title: AppStrings.homeServiceFlowers,
        eta: AppStrings.homeServiceFlowersEta,
        route: AppRoutes.storesFlowers,
        icon: Icons.local_florist_outlined,
        imageUrl: '$_assetBase/flowers.png?v6',
      ),
      _ServiceTile(
        title: AppStrings.homeServiceCosmetics,
        eta: AppStrings.homeServiceCosmeticsEta,
        route: AppRoutes.storesCosmetics,
        icon: Icons.spa_outlined,
        imageUrl: '$_assetBase/cosmetics.png?v6',
      ),
      _ServiceTile(
        title: AppStrings.homeServicePharmacy,
        eta: AppStrings.homeServicePharmacyEta,
        route: '/stores?type=pharmacy',
        icon: Icons.medical_services_outlined,
        imageUrl: '$_assetBase/pharmacy.png?v6',
      ),
    ];
    const restaurants = _ServiceTile(
      title: AppStrings.homeServiceRestaurants,
      eta: AppStrings.homeServiceRestaurantsEta,
      route: AppRoutes.allRestaurants,
      icon: Icons.restaurant_outlined,
      imageUrl: '$_assetBase/restaurants.png?v6',
      badge: AppStrings.homeServiceDeliveryBadge,
      flex: 2,
    );
    const products = _ServiceTile(
      title: AppStrings.homeServiceProducts,
      eta: AppStrings.homeServiceProductsEta,
      route: '/stores?type=grocery',
      icon: Icons.shopping_bag_outlined,
      imageUrl: '$_assetBase/products.png?v6',
      flex: 1,
    );

    return Column(
      children: [
        SizedBox(
          height: 120,
          child: Row(
            children: [
              for (var i = 0; i < top.length; i++) ...[
                if (i > 0) const SizedBox(width: 8),
                Expanded(child: _Tile(tile: top[i])),
              ],
            ],
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 120,
          child: Row(
            children: [
              Expanded(flex: restaurants.flex, child: const _Tile(tile: restaurants)),
              const SizedBox(width: 8),
              Expanded(flex: products.flex, child: const _Tile(tile: products)),
            ],
          ),
        ),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.tile});

  final _ServiceTile tile;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: () => context.push(tile.route),
        borderRadius: BorderRadius.circular(20),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              children: [
                Positioned(
                  left: AppSpacing.md,
                  top: AppSpacing.md,
                  right: 56,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tile.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.subtitle.copyWith(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        tile.eta,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (tile.badge != null)
                  Positioned(
                    left: AppSpacing.md,
                    bottom: AppSpacing.md,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.textPrimary,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        tile.badge!,
                        style: AppTypography.caption.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ),
                Positioned(
                  right: -8,
                  bottom: -10,
                  child: SizedBox(
                    width: 88,
                    height: 88,
                    child: tile.imageUrl != null
                        ? CachedNetworkImage(
                            imageUrl: tile.imageUrl!,
                            fit: BoxFit.contain,
                            errorWidget: (_, __, ___) => Icon(
                              tile.icon,
                              size: 40,
                              color: AppColors.textMuted,
                            ),
                          )
                        : Icon(tile.icon, size: 40, color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
