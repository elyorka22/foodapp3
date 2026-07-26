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
import '../../core/utils/image_url.dart';
import '../../features/restaurants/providers/dish_categories_provider.dart';
import '../models/dish_category_model.dart';
import 'dish_category_carousel.dart';

/// Home row: "All restaurants" card + image category carousel.
class HomeSecondaryBanners extends ConsumerWidget {
  const HomeSecondaryBanners({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(publicSettingsProvider);
    final categories = ref.watch(dishCategoriesProvider);

    return settings.when(
      data: (publicSettings) => categories.when(
        data: (items) => _HomeCategoryRow(
          settings: publicSettings,
          categories: items,
        ),
        loading: () => const _HomeCategoryRowSkeleton(),
        error: (_, __) => _HomeCategoryRow(
          settings: publicSettings,
          categories: const [],
        ),
      ),
      loading: () => const _HomeCategoryRowSkeleton(),
      error: (_, __) => categories.when(
        data: (items) => _HomeCategoryRow(
          settings: null,
          categories: items,
        ),
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
      ),
    );
  }
}

class _HomeCategoryRow extends StatelessWidget {
  const _HomeCategoryRow({
    required this.settings,
    required this.categories,
  });

  final PublicSettings? settings;
  final List<DishCategoryModel> categories;

  @override
  Widget build(BuildContext context) {
    final title = (settings?.homeRestaurantsBannerTitle.trim().isNotEmpty ?? false)
        ? settings!.homeRestaurantsBannerTitle.trim()
        : AppStrings.allRestaurants;
    final imageUrl = resolveImageUrl(settings?.homeRestaurantsBannerImageUrl);

    return SizedBox(
      height: 112,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _AllRestaurantsCard(title: title, imageUrl: imageUrl),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: DishCategoryCarousel(categories: categories),
          ),
        ],
      ),
    );
  }
}

class _AllRestaurantsCard extends StatelessWidget {
  const _AllRestaurantsCard({
    required this.title,
    required this.imageUrl,
  });

  final String title;
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(AppRoutes.allRestaurants),
      child: SizedBox(
        width: 88,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: imageUrl!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity,
                        errorWidget: (_, __, ___) => _fallback(),
                      )
                    : _fallback(),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fallback() {
    return Container(
      color: AppColors.primary,
      alignment: Alignment.center,
      padding: const EdgeInsets.all(8),
      child: Text(
        title,
        textAlign: TextAlign.center,
        maxLines: 3,
        overflow: TextOverflow.ellipsis,
        style: AppTypography.bodySmall.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w800,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _HomeCategoryRowSkeleton extends StatelessWidget {
  const _HomeCategoryRowSkeleton();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 112,
      child: Row(
        children: [
          SizedBox(
            width: 88,
            child: Column(
              children: [
                Expanded(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  height: 12,
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Row(
              children: List.generate(
                3,
                (i) => Padding(
                  padding: EdgeInsets.only(right: i == 2 ? 0 : 8),
                  child: SizedBox(
                    width: 88,
                    child: Column(
                      children: [
                        Expanded(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: AppColors.border,
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          height: 12,
                          margin: const EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            color: AppColors.border,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
