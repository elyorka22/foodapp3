import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/home_headline.dart';
import '../../../shared/widgets/home_promo_banners.dart';
import '../../../shared/widgets/home_restaurants_carousel.dart';
import '../../../shared/widgets/home_service_grid.dart';
import '../../../shared/widgets/home_shops_carousel.dart';
import '../../../shared/widgets/section_island.dart';
import '../../stores/providers/stores_provider.dart';
import '../providers/restaurants_provider.dart';

/// Home tab — same composition as web `page.tsx`.
class RestaurantsScreen extends ConsumerWidget {
  const RestaurantsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final banners = ref.watch(bannersProvider);
    final featuredStores = ref.watch(homeFeaturedStoresProvider);
    final restaurants = ref.watch(restaurantsListProvider(null));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(publicSettingsProvider);
            ref.invalidate(bannersProvider);
            ref.invalidate(homeFeaturedStoresProvider);
            ref.invalidate(restaurantsListProvider);
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(
              0,
              10,
              0,
              AppSpacing.xxl,
            ),
            children: [
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: HomeHeadline(),
              ),
              const SizedBox(height: SectionIsland.gap),
              const HomeServiceGrid(),
              const SizedBox(height: SectionIsland.gap),
              HomePromoBanners(
                banners: banners.valueOrNull ?? const [],
                isLoading: banners.isLoading,
              ),
              const SizedBox(height: SectionIsland.gap),
              HomeShopsCarousel(
                stores: featuredStores.valueOrNull ?? const [],
                isLoading: featuredStores.isLoading,
                total: featuredStores.valueOrNull?.length,
              ),
              const SizedBox(height: SectionIsland.gap),
              HomeRestaurantsCarousel(
                restaurants: restaurants.valueOrNull ?? const [],
                isLoading: restaurants.isLoading,
                total: restaurants.valueOrNull?.length,
              ),
              if (restaurants.hasError) ...[
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Text(
                    ApiException.formatError(restaurants.error!),
                    style: AppTypography.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              if (!restaurants.isLoading &&
                  !restaurants.hasError &&
                  (restaurants.valueOrNull?.isEmpty ?? false)) ...[
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Text(
                    AppStrings.restaurantsComingSoon,
                    style: AppTypography.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
