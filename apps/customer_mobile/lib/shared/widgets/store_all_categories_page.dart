import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../models/restaurant_model.dart';
import 'circle_icon_button.dart';
import 'store_category_grid.dart';

/// Full-screen grid with every store category.
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
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.sm,
                  AppSpacing.lg,
                  AppSpacing.xl,
                ),
                children: [
                  StoreCategoryGrid(
                    categories: categories,
                    showAllProductsTile: true,
                    onSelectCategory: (id) {
                      onSelect(id);
                      Navigator.of(context).pop();
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
