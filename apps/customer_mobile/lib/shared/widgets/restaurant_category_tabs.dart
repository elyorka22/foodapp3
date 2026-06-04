import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/models/restaurant_model.dart';

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
          _Tab(
            label: allLabel,
            active: activeId == 'all',
            onTap: () => onChanged('all'),
          ),
          for (final c in categories)
            _Tab(
              label: c.name,
              active: activeId == c.id,
              onTap: () => onChanged(c.id),
            ),
        ],
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 20),
        padding: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: active ? AppColors.textPrimary : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          style: AppTypography.subtitle.copyWith(
            fontSize: 15,
            color: active ? AppColors.textPrimary : AppColors.textMuted,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
