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
import '../../features/stores/providers/stores_provider.dart';
import '../models/business_model.dart';

/// Home service tiles driven by active business types (`homeGridRow` + `isActive`).
class HomeServiceGrid extends ConsumerWidget {
  const HomeServiceGrid({super.key});

  static const _tileHeight = 120.0;

  String _routeFor(BusinessTypeModel type) {
    if (type.isRestaurantType) return AppRoutes.allRestaurants;
    return '/stores/${type.slug}';
  }

  IconData _iconFor(BusinessTypeModel type) {
    final slug = type.slug.toLowerCase();
    if (type.isRestaurantType) return Icons.restaurant_outlined;
    if (slug == 'flowers') return Icons.local_florist_outlined;
    if (slug == 'perfume' || slug == 'cosmetics') return Icons.spa_outlined;
    if (slug == 'pharmacy') return Icons.medical_services_outlined;
    if (slug == 'grocery' || slug == 'products') {
      return Icons.shopping_bag_outlined;
    }
    return Icons.storefront_outlined;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overrides =
        ref.watch(publicSettingsProvider).valueOrNull?.homeServiceCards;
    final typesAsync = ref.watch(businessTypesProvider);
    final types = [...(typesAsync.valueOrNull ?? const <BusinessTypeModel>[])]
      ..sort((a, b) => (a.sortOrder ?? 0).compareTo(b.sortOrder ?? 0));

    final row1 = types.where((t) => t.homeGridRow == 1).toList();
    final row2 = types.where((t) => t.homeGridRow == 2).toList();
    BusinessTypeModel? restaurant;
    for (final t in row2) {
      if (t.isRestaurantType) {
        restaurant = t;
        break;
      }
    }
    final row2Others =
        row2.where((t) => t.id != restaurant?.id).toList(growable: false);

    if (typesAsync.isLoading && types.isEmpty) {
      return const SizedBox(height: _tileHeight);
    }
    if (row1.isEmpty && restaurant == null && row2Others.isEmpty) {
      return const SizedBox.shrink();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final contentWidth = constraints.maxWidth;
        final topTileWidth =
            (contentWidth * 0.44).clamp(164.0, double.infinity);

        return Column(
          children: [
            if (row1.isNotEmpty)
              SizedBox(
                height: _tileHeight,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  clipBehavior: Clip.none,
                  padding: EdgeInsets.zero,
                  itemCount: row1.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (context, index) {
                    final type = row1[index];
                    return SizedBox(
                      width: topTileWidth,
                      height: _tileHeight,
                      child: _ServiceTile(
                        title: type.name,
                        eta: type.description?.trim().isNotEmpty == true
                            ? type.description!.trim()
                            : AppStrings.homeServiceProductsEta,
                        route: _routeFor(type),
                        iconData: _iconFor(type),
                        layout: layoutForBusinessTypeSlug(
                          slug: type.slug,
                          imageUrl: type.imageUrl,
                          overrides: overrides,
                        ),
                        compact: true,
                      ),
                    );
                  },
                ),
              ),
            if (row1.isNotEmpty &&
                (restaurant != null || row2Others.isNotEmpty))
              const SizedBox(height: 12),
            if (restaurant != null || row2Others.isNotEmpty)
              SizedBox(
                height: _tileHeight,
                child: Row(
                  children: [
                    if (restaurant != null) ...[
                      Expanded(
                        flex: 165,
                        child: _ServiceTile(
                          title: restaurant.name,
                          eta: restaurant.description?.trim().isNotEmpty == true
                              ? restaurant.description!.trim()
                              : AppStrings.homeServiceRestaurantsEta,
                          route: _routeFor(restaurant),
                          iconData: _iconFor(restaurant),
                          badge: AppStrings.homeServiceDeliveryBadge,
                          layout: layoutForBusinessTypeSlug(
                            slug: restaurant.slug,
                            imageUrl: restaurant.imageUrl,
                            overrides: overrides,
                          ),
                          restaurantWide: true,
                        ),
                      ),
                      if (row2Others.isNotEmpty) const SizedBox(width: 12),
                    ],
                    for (var i = 0; i < row2Others.length; i++) ...[
                      if (i > 0) const SizedBox(width: 12),
                      Expanded(
                        flex: 100,
                        child: _ServiceTile(
                          title: row2Others[i].name,
                          eta: row2Others[i].description?.trim().isNotEmpty ==
                                  true
                              ? row2Others[i].description!.trim()
                              : AppStrings.homeServiceProductsEta,
                          route: _routeFor(row2Others[i]),
                          iconData: _iconFor(row2Others[i]),
                          layout: layoutForBusinessTypeSlug(
                            slug: row2Others[i].slug,
                            imageUrl: row2Others[i].imageUrl,
                            overrides: overrides,
                          ),
                        ),
                      ),
                    ],
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
    required this.title,
    required this.eta,
    required this.route,
    required this.iconData,
    required this.layout,
    this.badge,
    this.compact = false,
    this.restaurantWide = false,
  });

  final String title;
  final String eta;
  final String route;
  final IconData iconData;
  final HomeServiceCardLayout layout;
  final String? badge;
  final bool compact;
  final bool restaurantWide;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppSpacing.serviceTileRadius);

    return Material(
      color: AppColors.surface,
      borderRadius: radius,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(route),
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
              final hasImage = layout.imageUrl.trim().isNotEmpty;

              return Stack(
                clipBehavior: Clip.hardEdge,
                children: [
                  if (hasImage)
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
                              child: _FallbackIcon(
                                iconData: iconData,
                                compact: compact,
                                restaurantWide: restaurantWide,
                              ),
                            ),
                          ),
                        ),
                      ),
                    )
                  else
                    Align(
                      alignment: Alignment.bottomRight,
                      child: _FallbackIcon(
                        iconData: iconData,
                        compact: compact,
                        restaurantWide: restaurantWide,
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
                            title,
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
                          eta,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontSize: compact ? 11 : 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const Spacer(),
                        if (badge != null)
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
                              badge!,
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

class _FallbackIcon extends StatelessWidget {
  const _FallbackIcon({
    required this.iconData,
    required this.compact,
    required this.restaurantWide,
  });

  final IconData iconData;
  final bool compact;
  final bool restaurantWide;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: compact ? 56 : 72,
      height: compact ? 56 : 72,
      margin: const EdgeInsets.only(right: 4, bottom: 4),
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFE4E4E7), Color(0xFFF4F4F5)],
        ),
      ),
      child: Icon(
        iconData,
        size: compact ? 30 : (restaurantWide ? 52 : 40),
        color: AppColors.textPrimary,
      ),
    );
  }
}
