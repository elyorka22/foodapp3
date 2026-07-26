import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/models/restaurant_model.dart';

/// Chip-style category selector (rounded pills, horizontal scroll).
class RestaurantCategoryTabs extends StatelessWidget {
  const RestaurantCategoryTabs({
    super.key,
    required this.categories,
    required this.activeId,
    required this.onChanged,
    this.allLabel = 'Hammasi',
  });

  final List<RestaurantCategoryModel> categories;
  final String activeId;
  final ValueChanged<String> onChanged;
  final String allLabel;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _Chip(
            label: allLabel,
            active: activeId == 'all',
            onTap: () => onChanged('all'),
          ),
          for (final c in categories)
            _Chip(
              label: c.name,
              active: activeId == c.id,
              onTap: () => onChanged(c.id),
            ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Material(
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
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Text(
              label,
              style: AppTypography.subtitle.copyWith(
                fontSize: 14,
                color: active ? Colors.white : AppColors.textSecondary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
