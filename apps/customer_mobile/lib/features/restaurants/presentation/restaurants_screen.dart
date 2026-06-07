import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_restaurant_card.dart';
import '../../../shared/widgets/home_banner_grid.dart';
import '../../../shared/widgets/home_headline.dart';
import '../../stores/providers/stores_provider.dart';
import '../providers/restaurants_provider.dart';

class RestaurantsScreen extends ConsumerWidget {
  const RestaurantsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final banners = ref.watch(bannersProvider);
    final featuredStores = ref.watch(homeFeaturedStoresProvider);
    final restaurants = ref.watch(restaurantsListProvider(null));

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(publicSettingsProvider);
            ref.invalidate(bannersProvider);
            ref.invalidate(homeFeaturedStoresProvider);
            ref.invalidate(restaurantsListProvider);
          },
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              const HomeHeadline(),
              const SizedBox(height: AppSpacing.lg),
              banners.when(
                data: (items) => featuredStores.when(
                  data: (stores) => HomeBannerGrid(
                    banners: items,
                    featuredStores: stores,
                  ),
                  loading: () => const SizedBox(
                    height: 280,
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (_, __) => HomeBannerGrid(
                    banners: items,
                    featuredStores: const [],
                  ),
                ),
                loading: () => const SizedBox(
                  height: 280,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (_, __) => featuredStores.when(
                  data: (stores) => HomeBannerGrid(
                    banners: const [],
                    featuredStores: stores,
                  ),
                  loading: () => const SizedBox(
                    height: 280,
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(AppStrings.popular, style: AppTypography.subtitle),
              const SizedBox(height: AppSpacing.md),
              restaurants.when(
                data: (list) {
                  if (list.isEmpty) {
                    return Text(AppStrings.errorGeneric, style: AppTypography.bodySmall);
                  }
                  return Column(
                    children: [
                      for (final r in list) ...[
                        FoodAppRestaurantCard(
                          restaurant: r,
                          onTap: () => context.go('/restaurants/${r.slug}'),
                        ),
                        const SizedBox(height: AppSpacing.md),
                      ],
                    ],
                  );
                },
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (e, _) => Text(
                  ApiException.formatError(e),
                  style: AppTypography.bodySmall,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
