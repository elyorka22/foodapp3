import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../models/restaurant_model.dart';
import 'store_category_grid.dart';

/// Opens the full store category grid as a bottom sheet (not a separate page).
Future<void> showStoreAllCategoriesSheet({
  required BuildContext context,
  required List<RestaurantCategoryModel> categories,
  required ValueChanged<String> onSelect,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) {
      final maxH = MediaQuery.sizeOf(sheetContext).height * 0.85;
      return Container(
        constraints: BoxConstraints(maxHeight: maxH),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 10),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFD4D4D8),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  12,
                  AppSpacing.sm,
                  8,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        AppStrings.categories,
                        style: AppTypography.title.copyWith(
                          fontWeight: FontWeight.w800,
                          fontSize: 18,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(sheetContext).pop(),
                      icon: const Icon(Icons.close_rounded, size: 22),
                      style: IconButton.styleFrom(
                        backgroundColor: const Color(0xFFF4F4F5),
                      ),
                    ),
                  ],
                ),
              ),
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    4,
                    AppSpacing.lg,
                    AppSpacing.xl,
                  ),
                  child: StoreCategoryGrid(
                    categories: categories,
                    onSelectCategory: (id) {
                      onSelect(id);
                      Navigator.of(sheetContext).pop();
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}
