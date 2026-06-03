import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_restaurant_card.dart';
import '../providers/dish_categories_provider.dart';
import '../providers/restaurants_provider.dart';
import '../../../shared/widgets/dish_category_carousel.dart';

class RestaurantsScreen extends ConsumerStatefulWidget {
  const RestaurantsScreen({super.key});

  @override
  ConsumerState<RestaurantsScreen> createState() => _RestaurantsScreenState();
}

class _RestaurantsScreenState extends ConsumerState<RestaurantsScreen> {
  final _searchController = TextEditingController();
  final _bannerController = PageController();
  String _search = '';

  @override
  void dispose() {
    _searchController.dispose();
    _bannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final banners = ref.watch(bannersProvider);
    final dishCategories = ref.watch(dishCategoriesProvider);
    final restaurants = ref.watch(restaurantsListProvider(_search.isEmpty ? null : _search));

    return Scaffold(
      appBar: AppBar(title: Text(AppStrings.navRestaurants, style: AppTypography.title)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(bannersProvider);
          ref.invalidate(dishCategoriesProvider);
          ref.invalidate(restaurantsListProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: AppStrings.searchRestaurants,
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _search.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _search = '');
                        },
                      )
                    : null,
              ),
              onSubmitted: (v) => setState(() => _search = v.trim()),
            ),
            const SizedBox(height: AppSpacing.lg),
            banners.when(
              data: (items) {
                final hero = items.where((b) => b.placement != 'PROMO').toList();
                if (hero.isEmpty) return const SizedBox.shrink();
                return Column(
                  children: [
                    SizedBox(
                      height: 160,
                      child: PageView.builder(
                        controller: _bannerController,
                        itemCount: hero.length,
                        itemBuilder: (_, i) {
                          final b = hero[i];
                          return ClipRRect(
                            borderRadius: BorderRadius.circular(AppSpacing.bannerRadius),
                            child: Image.network(
                              b.imageUrl,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              errorBuilder: (_, __, ___) => Container(
                                color: AppColors.primarySoft,
                                child: Center(child: Text(b.title)),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 8),
                    SmoothPageIndicator(
                      controller: _bannerController,
                      count: hero.length,
                      effect: const WormEffect(dotHeight: 6, dotWidth: 6, activeDotColor: AppColors.primary),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                  ],
                );
              },
              loading: () => const SizedBox(height: 160, child: Center(child: CircularProgressIndicator())),
              error: (_, __) => const SizedBox.shrink(),
            ),
            dishCategories.when(
              data: (cats) {
                if (cats.isEmpty) return const SizedBox.shrink();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(AppStrings.categories, style: AppTypography.subtitle),
                    const SizedBox(height: AppSpacing.sm),
                    DishCategoryCarousel(categories: cats),
                    const SizedBox(height: AppSpacing.lg),
                  ],
                );
              },
              loading: () => const SizedBox(height: 80, child: Center(child: CircularProgressIndicator())),
              error: (_, __) => const SizedBox.shrink(),
            ),
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
              loading: () => const Center(child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(),
              )),
              error: (e, _) => Text('$e', style: AppTypography.bodySmall),
            ),
          ],
        ),
      ),
    );
  }
}
