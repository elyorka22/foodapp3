import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/restaurant_model.dart';
import 'circle_icon_button.dart';

/// Full-screen 3-column category grid (store interior).
class StoreAllCategoriesPage extends StatelessWidget {
  const StoreAllCategoriesPage({
    super.key,
    required this.categories,
    required this.onSelect,
  });

  final List<RestaurantCategoryModel> categories;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F5),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.sm,
                AppSpacing.lg,
                AppSpacing.sm,
              ),
              child: Row(
                children: [
                  CircleIconButton(
                    icon: Icons.arrow_back_rounded,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  Expanded(
                    child: Text(
                      AppStrings.categories,
                      textAlign: TextAlign.center,
                      style: AppTypography.title.copyWith(
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                      ),
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.sm,
                  AppSpacing.lg,
                  AppSpacing.xl,
                ),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1 / 1.05,
                ),
                itemCount: categories.length + 1,
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _CategoryTile(
                      title: AppStrings.storeAllCategories,
                      gradient: true,
                      onTap: () {
                        onSelect('all');
                        Navigator.of(context).pop();
                      },
                    );
                  }
                  final cat = categories[index - 1];
                  return _CategoryTile(
                    title: cat.name,
                    imageUrl: cat.imageUrl,
                    onTap: () {
                      onSelect(cat.id);
                      Navigator.of(context).pop();
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({
    required this.title,
    required this.onTap,
    this.imageUrl,
    this.gradient = false,
  });

  final String title;
  final VoidCallback onTap;
  final String? imageUrl;
  final bool gradient;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveImageUrl(imageUrl);
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Stack(
          children: [
            if (gradient)
              Positioned(
                right: -4,
                bottom: -4,
                child: Container(
                  width: 90,
                  height: 90,
                  decoration: const BoxDecoration(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(28),
                    ),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFFE4E4E7), Color(0xFFF4F4F5)],
                    ),
                  ),
                ),
              ),
            if (resolved != null && resolved.isNotEmpty)
              Positioned(
                right: -8,
                bottom: -8,
                width: 90,
                height: 90,
                child: CachedNetworkImage(
                  imageUrl: resolved,
                  fit: BoxFit.contain,
                  errorWidget: (_, __, ___) => const SizedBox.shrink(),
                ),
              )
            else if (!gradient)
              Positioned(
                right: -4,
                bottom: -4,
                child: Container(
                  width: 72,
                  height: 72,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: Color(0xFFF4F4F5),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(24),
                    ),
                  ),
                  child: Text(
                    title.isNotEmpty ? title[0].toUpperCase() : '?',
                    style: AppTypography.title.copyWith(
                      color: const Color(0xFFD4D4D8),
                      fontSize: 28,
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(10),
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
    );
  }
}
