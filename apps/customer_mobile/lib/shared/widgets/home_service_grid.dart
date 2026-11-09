import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/public_settings_provider.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/home_service_cards.dart';

class _ServiceCard {
  const _ServiceCard({
    required this.keyName,
    required this.title,
    required this.eta,
    required this.route,
    required this.icon,
    this.badge,
  });

  final HomeServiceCardKey keyName;
  final String title;
  final String eta;
  final String route;
  final IconData icon;
  final String? badge;
}

/// Matches web `home-service-grid.tsx` + `home-service-cards.ts` layouts.
class HomeServiceGrid extends ConsumerWidget {
  const HomeServiceGrid({super.key});

  static const _tileHeight = 120.0;

  static const _top = [
    _ServiceCard(
      keyName: HomeServiceCardKey.flowers,
      title: AppStrings.homeServiceFlowers,
      eta: AppStrings.homeServiceFlowersEta,
      route: AppRoutes.storesFlowers,
      icon: Icons.local_florist_outlined,
    ),
    _ServiceCard(
      keyName: HomeServiceCardKey.cosmetics,
      title: AppStrings.homeServiceCosmetics,
      eta: AppStrings.homeServiceCosmeticsEta,
      route: AppRoutes.storesCosmetics,
      icon: Icons.spa_outlined,
    ),
    _ServiceCard(
      keyName: HomeServiceCardKey.pharmacy,
      title: AppStrings.homeServicePharmacy,
      eta: AppStrings.homeServicePharmacyEta,
      route: '/stores/pharmacy',
      icon: Icons.medical_services_outlined,
    ),
  ];

  static const _restaurants = _ServiceCard(
    keyName: HomeServiceCardKey.restaurants,
    title: AppStrings.homeServiceRestaurants,
    eta: AppStrings.homeServiceRestaurantsEta,
    route: AppRoutes.allRestaurants,
    icon: Icons.restaurant_outlined,
    badge: AppStrings.homeServiceDeliveryBadge,
  );

  static const _products = _ServiceCard(
    keyName: HomeServiceCardKey.products,
    title: AppStrings.homeServiceProducts,
    eta: AppStrings.homeServiceProductsEta,
    route: AppRoutes.storesGrocery,
    icon: Icons.shopping_bag_outlined,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overrides = ref.watch(publicSettingsProvider).valueOrNull?.homeServiceCards;

    HomeServiceCardLayout layoutFor(HomeServiceCardKey key) =>
        mergeHomeServiceCard(key, overrides?[key]);

    return LayoutBuilder(
      builder: (context, constraints) {
        // Parent already applies page px-16; % matches web content column.
        final contentWidth = constraints.maxWidth;
        // web: w-[44%] min-w-[10.25rem] (= 164)
        final topTileWidth = (contentWidth * 0.44).clamp(164.0, double.infinity);

        return Column(
          children: [
            SizedBox(
              height: _tileHeight,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                clipBehavior: Clip.none,
                padding: EdgeInsets.zero,
                itemCount: _top.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10), // gap-2.5
                itemBuilder: (context, index) {
                  final card = _top[index];
                  return SizedBox(
                    width: topTileWidth,
                    height: _tileHeight,
                    child: _ServiceTile(
                      card: card,
                      layout: layoutFor(card.keyName),
                      compact: true,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12), // space-y-3
            SizedBox(
              height: _tileHeight,
              child: Row(
                children: [
                  Expanded(
                    flex: 165, // grid-cols-[1.65fr_1fr]
                    child: _ServiceTile(
                      card: _restaurants,
                      layout: layoutFor(HomeServiceCardKey.restaurants),
                    ),
                  ),
                  const SizedBox(width: 12), // gap-3
                  Expanded(
                    flex: 100,
                    child: _ServiceTile(
                      card: _products,
                      layout: layoutFor(HomeServiceCardKey.products),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _ServiceTile extends StatelessWidget {
  const _ServiceTile({
    required this.card,
    required this.layout,
    this.compact = false,
  });

  final _ServiceCard card;
  final HomeServiceCardLayout layout;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppSpacing.serviceTileRadius);

    return Material(
      color: AppColors.surface,
      borderRadius: radius,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(card.route),
        borderRadius: radius,
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: radius,
            border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
            boxShadow: AppShadows.serviceTile,
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final tileW = constraints.maxWidth;
              final imageW = tileW * layout.widthPercent / 100;

              return Stack(
                clipBehavior: Clip.hardEdge,
                children: [
                  // Same as web: absolute img with width%, right, bottom, rotate.
                  Positioned(
                    right: layout.right,
                    bottom: layout.bottom,
                    child: Transform.rotate(
                      angle: layout.rotateRadians,
                      alignment: Alignment.center,
                      child: SizedBox(
                        width: imageW,
                        child: CachedNetworkImage(
                          imageUrl: layout.imageUrl,
                          width: imageW,
                          fit: BoxFit.fitWidth,
                          alignment: Alignment.center,
                          fadeInDuration: Duration.zero,
                          fadeOutDuration: Duration.zero,
                          placeholder: (_, __) => SizedBox(
                            width: imageW,
                            height: imageW * 0.85,
                          ),
                          errorWidget: (_, __, ___) => Align(
                            alignment: Alignment.bottomRight,
                            child: Container(
                              width: compact ? 56 : 72,
                              height: compact ? 56 : 72,
                              margin: const EdgeInsets.only(right: 4, bottom: 4),
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    Color(0xFFE4E4E7),
                                    Color(0xFFF4F4F5),
                                  ],
                                ),
                              ),
                              child: Icon(
                                card.icon,
                                size: compact ? 30 : (card.keyName ==
                                        HomeServiceCardKey.restaurants
                                    ? 52
                                    : 40),
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(compact ? 12 : 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ConstrainedBox(
                          constraints: BoxConstraints(
                            maxWidth: tileW * (compact ? 0.78 : 0.62),
                          ),
                          child: Text(
                            card.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.subtitle.copyWith(
                              fontSize: compact ? 13 : 15,
                              fontWeight: FontWeight.w700,
                              height: 1.15,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          card.eta,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontSize: compact ? 11 : 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const Spacer(),
                        if (card.badge != null)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius:
                                  BorderRadius.circular(AppSpacing.pillRadius),
                            ),
                            child: Text(
                              card.badge!,
                              style: AppTypography.caption.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 11,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
