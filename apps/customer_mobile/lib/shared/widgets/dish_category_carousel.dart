import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/dish_category_model.dart';

class DishCategoryCarousel extends StatelessWidget {
  const DishCategoryCarousel({super.key, required this.categories});

  final List<DishCategoryModel> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 112,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (_, i) {
          final cat = categories[i];
          final imageUrl = cat.resolvedImageUrl;
          return GestureDetector(
            onTap: () => context.push(AppRoutes.categoryProducts(cat.slug)),
            child: SizedBox(
              width: 88,
              child: Column(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                      child: imageUrl != null
                          ? CachedNetworkImage(
                              imageUrl: imageUrl,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => _fallback(cat.name),
                            )
                          : _fallback(cat.name),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    cat.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _fallback(String name) {
    return Container(
      width: double.infinity,
      color: AppColors.primarySoft,
      alignment: Alignment.center,
      padding: const EdgeInsets.all(4),
      child: Text(
        name,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
      ),
    );
  }
}
