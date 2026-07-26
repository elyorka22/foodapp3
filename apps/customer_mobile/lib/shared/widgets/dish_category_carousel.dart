import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_framing.dart';
import '../../../shared/models/dish_category_model.dart';

/// Horizontal image cards for dish categories.
class DishCategoryCarousel extends StatelessWidget {
  const DishCategoryCarousel({
    super.key,
    required this.categories,
  });

  final List<DishCategoryModel> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();

    return ListView.separated(
      scrollDirection: Axis.horizontal,
      itemCount: categories.length,
      padding: EdgeInsets.zero,
      separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
      itemBuilder: (_, i) {
        final cat = categories[i];
        return _CategoryCard(
          category: cat,
          onTap: () => context.push(AppRoutes.categoryProducts(cat.slug)),
        );
      },
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({
    required this.category,
    required this.onTap,
  });

  final DishCategoryModel category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final imageUrl = category.resolvedImageUrl;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 88,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: imageUrl != null
                    ? applyImageFraming(
                        imageScale: category.imageScale,
                        imagePositionX: category.imagePositionX,
                        imagePositionY: category.imagePositionY,
                        child: CachedNetworkImage(
                          imageUrl: imageUrl,
                          width: double.infinity,
                          height: double.infinity,
                          fit: BoxFit.cover,
                          alignment: Alignment(
                            ((category.imagePositionX ?? 50) / 50) - 1,
                            ((category.imagePositionY ?? 50) / 50) - 1,
                          ),
                          errorWidget: (_, __, ___) => _fallback(category.name),
                        ),
                      )
                    : _fallback(category.name),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              category.name,
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

  Widget _fallback(String name) {
    return Container(
      width: double.infinity,
      color: AppColors.primarySoft,
      alignment: Alignment.center,
      padding: const EdgeInsets.all(6),
      child: Text(
        name,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
      ),
    );
  }
}
