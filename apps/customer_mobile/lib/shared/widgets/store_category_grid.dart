import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/restaurant_model.dart';

class StoreCategoryTile extends StatelessWidget {
  const StoreCategoryTile({
    super.key,
    required this.title,
    required this.onTap,
    this.imageUrl,
    this.imageScale,
    this.imagePositionX,
    this.imagePositionY,
    this.gradient = false,
    this.active = false,
  });

  final String title;
  final VoidCallback onTap;
  final String? imageUrl;
  final int? imageScale;
  final int? imagePositionX;
  final int? imagePositionY;
  final bool gradient;
  final bool active;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveImageUrl(imageUrl);
    final hasImage = !gradient && resolved != null && resolved.isNotEmpty;
    final scale = ((imageScale ?? 100).clamp(100, 200)) / 100.0;
    final x = (imagePositionX ?? 50).clamp(0, 100);
    final y = (imagePositionY ?? 50).clamp(0, 100);

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: active
                ? Border.all(color: AppColors.textPrimary, width: 2)
                : Border.all(color: const Color(0x0A000000)),
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (gradient)
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFFF4F4F5), Color(0xFFE4E4E7)],
                    ),
                  ),
                ),
              if (hasImage)
                // Pan via left/top so vertical shift works on square tiles.
                LayoutBuilder(
                  builder: (context, box) {
                    final w = box.maxWidth * scale;
                    final h = box.maxHeight * scale;
                    final left = box.maxWidth * x / 100 - w / 2;
                    final top = box.maxHeight * y / 100 - h / 2;
                    return Stack(
                      clipBehavior: Clip.hardEdge,
                      children: [
                        Positioned(
                          left: left,
                          top: top,
                          width: w,
                          height: h,
                          child: CachedNetworkImage(
                            imageUrl: resolved,
                            fit: BoxFit.cover,
                            width: w,
                            height: h,
                            errorWidget: (_, __, ___) =>
                                const SizedBox.shrink(),
                          ),
                        ),
                      ],
                    );
                  },
                )
              else if (!gradient)
                Center(
                  child: Text(
                    title.isNotEmpty ? title[0].toUpperCase() : '?',
                    style: AppTypography.title.copyWith(
                      color: const Color(0xFFD4D4D8),
                      fontSize: 32,
                    ),
                  ),
                ),
              Positioned(
                top: 12,
                left: 10,
                right: 10,
                child: Text(
                  title,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    height: 1.2,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Square category grid for store menu preview / all-categories page.
class StoreCategoryGrid extends StatelessWidget {
  const StoreCategoryGrid({
    super.key,
    required this.categories,
    required this.onSelectCategory,
    this.limit,
    this.activeId,
    this.onOpenAll,
    this.allCategoriesImageUrl,
    this.allCategoriesImageScale,
    this.allCategoriesImagePositionX,
    this.allCategoriesImagePositionY,
    this.showAllProductsTile = false,
  });

  final List<RestaurantCategoryModel> categories;
  final ValueChanged<String> onSelectCategory;
  final int? limit;
  final String? activeId;
  final VoidCallback? onOpenAll;
  final String? allCategoriesImageUrl;
  final int? allCategoriesImageScale;
  final int? allCategoriesImagePositionX;
  final int? allCategoriesImagePositionY;
  final bool showAllProductsTile;

  @override
  Widget build(BuildContext context) {
    final visible =
        limit == null ? categories : categories.take(limit!).toList();
    final allTileImg = allCategoriesImageUrl?.trim();
    final hasAllTileImg = allTileImg != null && allTileImg.isNotEmpty;
    final tiles = <Widget>[
      if (showAllProductsTile)
        StoreCategoryTile(
          title: AppStrings.allCategoryProducts,
          gradient: true,
          active: activeId == 'all',
          onTap: () => onSelectCategory('all'),
        ),
      for (final cat in visible)
        StoreCategoryTile(
          title: cat.name,
          imageUrl: cat.imageUrl,
          imageScale: cat.imageScale,
          imagePositionX: cat.imagePositionX,
          imagePositionY: cat.imagePositionY,
          active: activeId == cat.id,
          onTap: () => onSelectCategory(cat.id),
        ),
      if (onOpenAll != null)
        StoreCategoryTile(
          title: AppStrings.storeAllCategories,
          imageUrl: hasAllTileImg ? allTileImg : null,
          imageScale: allCategoriesImageScale,
          imagePositionX: allCategoriesImagePositionX,
          imagePositionY: allCategoriesImagePositionY,
          gradient: !hasAllTileImg,
          onTap: onOpenAll!,
        ),
    ];

    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1 / 1.05,
      children: tiles,
    );
  }
}
