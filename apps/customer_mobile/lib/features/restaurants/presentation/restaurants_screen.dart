import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/home_headline.dart';
import '../../../shared/widgets/home_promo_banners.dart';
import '../../../shared/widgets/home_restaurants_carousel.dart';
import '../../../shared/widgets/home_service_grid.dart';
import '../../../shared/widgets/home_shops_carousel.dart';
import '../../stores/providers/stores_provider.dart';
import '../providers/restaurants_provider.dart';

/// Home tab — same island as the web home.
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
        bottom: false,
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            ref.invalidate(publicSettingsProvider);
            ref.invalidate(bannersProvider);
            ref.invalidate(homeFeaturedStoresProvider);
            ref.invalidate(restaurantsListProvider);
          },
          child: LayoutBuilder(
            builder: (context, constraints) {
              // City row is 44px plus the padding around it.
              const headerHeight = 66.0;
              final islandMinHeight = constraints.maxHeight - headerHeight;

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(16, 10, 16, 12),
                    child: HomeHeadline(),
                  ),
                  ConstrainedBox(
                    constraints: BoxConstraints(minHeight: islandMinHeight),
                    child: Container(
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(32),
                        ),
                      ),
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const HomeServiceGrid(),
                          const SizedBox(height: 20),
                          HomePromoBanners(
                            banners: banners.valueOrNull ?? const [],
                            isLoading: banners.isLoading,
                          ),
                          const SizedBox(height: 24),
                          HomeRestaurantsCarousel(
                            restaurants: restaurants.valueOrNull ?? const [],
                            isLoading: restaurants.isLoading,
                            total: restaurants.valueOrNull?.length,
                          ),
                          const SizedBox(height: 24),
                          HomeShopsCarousel(
                            stores: featuredStores.valueOrNull ?? const [],
                            isLoading: featuredStores.isLoading,
                            total: featuredStores.valueOrNull?.length,
                          ),
                          if (restaurants.hasError) ...[
                            const SizedBox(height: 16),
                            Text(
                              ApiException.formatError(restaurants.error!),
                              style: AppTypography.bodySmall,
                              textAlign: TextAlign.center,
                            ),
                          ],
                          if (!restaurants.isLoading &&
                              !restaurants.hasError &&
                              (restaurants.valueOrNull?.isEmpty ?? false)) ...[
                            const SizedBox(height: 16),
                            Text(
                              AppStrings.restaurantsComingSoon,
                              style: AppTypography.bodySmall,
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ],
                      ),
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
