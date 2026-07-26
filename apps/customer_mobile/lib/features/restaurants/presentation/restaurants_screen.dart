import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/banner_model.dart';
import '../../../shared/models/business_model.dart';
import '../../../shared/widgets/food_app_restaurant_card.dart';
import '../../../shared/widgets/home_banner_grid.dart';
import '../../../shared/widgets/home_headline.dart';
import '../../../shared/widgets/home_secondary_banners.dart';
import '../../../shared/widgets/home_store_banners_carousel.dart';
import '../../stores/providers/stores_provider.dart';
import '../providers/dish_categories_provider.dart';
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
            ref.invalidate(dishCategoriesProvider);
            ref.invalidate(restaurantsListProvider);
          },
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              const HomeHeadline(),
              const SizedBox(height: AppSpacing.lg),
              _HomeBannerSection(
                banners: banners,
                featuredStores: featuredStores,
              ),
              HomeStoreBannersCarousel(
                banners: banners.valueOrNull ?? const [],
                stores: featuredStores.valueOrNull ?? const [],
              ),
              const SizedBox(height: AppSpacing.md),
              const HomeSecondaryBanners(),
              const SizedBox(height: AppSpacing.lg),
              Text(AppStrings.popular, style: AppTypography.subtitle),
              const SizedBox(height: AppSpacing.md),
              restaurants.when(
                data: (list) {
                  if (list.isEmpty) {
                    return Text(AppStrings.errorGeneric, style: AppTypography.bodySmall);
                  }
                  return GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: list.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 3 / 4,
                    ),
                    itemBuilder: (context, index) {
                      final r = list[index];
                      return FoodAppRestaurantCard(
                        restaurant: r,
                        onTap: () => context.go('/restaurants/${r.slug}'),
                      );
                    },
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

/// Shows banners and stores independently — one slow request must not block the other.
class _HomeBannerSection extends StatelessWidget {
  const _HomeBannerSection({
    required this.banners,
    required this.featuredStores,
  });

  final AsyncValue<List<BannerModel>> banners;
  final AsyncValue<List<BusinessModel>> featuredStores;

  @override
  Widget build(BuildContext context) {
    final bothLoading = banners.isLoading && featuredStores.isLoading;
    if (bothLoading) {
      return const SizedBox(
        height: 280,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return HomeBannerGrid(
      banners: banners.valueOrNull ?? const [],
      featuredStores: featuredStores.valueOrNull ?? const [],
    );
  }
}
