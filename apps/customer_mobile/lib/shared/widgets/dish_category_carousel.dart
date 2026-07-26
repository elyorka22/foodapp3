import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/dish_category_model.dart';

/// Horizontal pill chips for dish categories (reference: drink-app category bar).
class DishCategoryCarousel extends StatelessWidget {
  const DishCategoryCarousel({
    super.key,
    required this.categories,
    this.activeSlug,
  });

  final List<DishCategoryModel> categories;
  final String? activeSlug;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();

    return Align(
      alignment: Alignment.centerLeft,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        padding: EdgeInsets.zero,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (_, i) {
          final cat = categories[i];
          final active = activeSlug != null && activeSlug == cat.slug;
          return Center(
            child: _CategoryPill(
              label: cat.name,
              active: active,
              onTap: () => context.push(AppRoutes.categoryProducts(cat.slug)),
            ),
          );
        },
      ),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  const _CategoryPill({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: active ? AppColors.primary : Colors.white,
      shape: StadiumBorder(
        side: BorderSide(
          color: active ? AppColors.primary : AppColors.border,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        customBorder: const StadiumBorder(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          child: Text(
            label,
            style: AppTypography.subtitle.copyWith(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: active ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
