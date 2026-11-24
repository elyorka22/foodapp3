import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/public_settings_provider.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/home_service_cards.dart';
import '../../features/stores/providers/stores_provider.dart';
import '../models/business_model.dart';


/// Home category grid: restaurants + grocery, then flowers, perfume, all categories.
class HomeServiceGrid extends ConsumerWidget {
  const HomeServiceGrid({super.key});

  static const _tileHeight = 112.0;

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
    final types = typesAsync.valueOrNull ?? const <BusinessTypeModel>[];

    BusinessTypeModel? find(bool Function(BusinessTypeModel) test) {
      for (final type in types) {
        if (test(type)) return type;
      }
      return null;
    }

    final restaurant = find((type) => type.isRestaurantType);
    final grocery = find((type) {
      final slug = type.slug.toLowerCase();
      return slug == 'grocery' || slug == 'products';
    });
    final flowers = find((type) => type.slug.toLowerCase() == 'flowers');
    final perfume = find((type) {
      final slug = type.slug.toLowerCase();
      return slug == 'perfume' || slug == 'cosmetics';
    });

    if (typesAsync.isLoading && types.isEmpty) {
      return const SizedBox(height: _tileHeight);
    }

    String etaFor(BusinessTypeModel type, String fallback) {
      final text = type.description?.trim();
      if (text != null && text.isNotEmpty) return text;
      return fallback;
    }

    Widget tile(BusinessTypeModel type, {String? badge}) {
      return _ServiceTile(
        title: type.name,
        eta: etaFor(
          type,
          type.isRestaurantType
              ? AppStrings.homeServiceRestaurantsEta
              : AppStrings.homeServiceProductsEta,
        ),
        route: _routeFor(type),
        iconData: _iconFor(type),
        badge: badge,
        layout: layoutForBusinessTypeSlug(
          slug: type.slug,
          imageUrl: type.imageUrl,
          overrides: overrides,
        ),
      );
    }

    return Column(
      children: [
        if (restaurant != null || grocery != null)
          SizedBox(
            height: _tileHeight,
            child: Row(
              children: [
                if (restaurant != null)
                  Expanded(
                    child: tile(
                      restaurant,
                      badge: AppStrings.homeServiceDeliveryBadge,
                    ),
                  ),
                if (restaurant != null && grocery != null)
                  const SizedBox(width: 10),
                if (grocery != null) Expanded(child: tile(grocery)),
              ],
            ),
          ),
        const SizedBox(height: 10),
        SizedBox(
          height: _tileHeight,
          child: Row(
            children: [
              if (flowers != null) Expanded(child: tile(flowers)),
              if (flowers != null) const SizedBox(width: 10),
              if (perfume != null) Expanded(child: tile(perfume)),
              if (perfume != null) const SizedBox(width: 10),
              const Expanded(child: _AllCategoriesTile()),
            ],
          ),
        ),
      ],
    );
  }
}

class _AllCategoriesTile extends StatelessWidget {
  const _AllCategoriesTile();

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.background,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: () => context.push(AppRoutes.homeCategories),
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppStrings.storeAllCategories,
                style: AppTypography.subtitle.copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  height: 1.15,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_forward, size: 16),
              ),
            ],
          ),
        ),
      ),
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
    final radius = BorderRadius.circular(22);

    return Material(
      color: AppColors.background,
      borderRadius: radius,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(route),
        borderRadius: radius,
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: radius,
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
                        Text(
                          title,
                          style: AppTypography.subtitle.copyWith(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            height: 1.15,
                            color: AppColors.textPrimary,
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
                              color: const Color(0xFF18181B),
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
