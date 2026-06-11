import 'package:flutter/material.dart';
import '../../core/jobs/job_service_type.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class ServiceFilterChips extends StatelessWidget {
  const ServiceFilterChips({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  final JobServiceType? selected;
  final ValueChanged<JobServiceType?> onSelected;

  @override
  Widget build(BuildContext context) {
    final types = [null, ...JobServiceType.values];

    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: types.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final type = types[index];
          final isSelected = selected == type;
          final label = type == null ? AppStrings.filterAll : type.label;
          final color = type?.color ?? AppColors.primary;

          return FilterChip(
            label: Text(label),
            selected: isSelected,
            onSelected: (_) => onSelected(type),
            showCheckmark: false,
            labelStyle: AppTypography.caption.copyWith(
              color: isSelected ? AppColors.onPrimary : AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
            backgroundColor: AppColors.surfaceElevated,
            selectedColor: color,
            side: BorderSide(
              color: isSelected ? color : AppColors.border,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 4),
          );
        },
      ),
    );
  }
}
