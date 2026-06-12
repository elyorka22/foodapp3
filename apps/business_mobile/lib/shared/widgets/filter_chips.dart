import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class FilterChipsRow extends StatelessWidget {
  const FilterChipsRow({
    super.key,
    required this.options,
    required this.selected,
    required this.onSelected,
  });

  final List<FilterChipOption> options;
  final String? selected;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: options.map((option) {
          final isSelected = selected == option.value;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(option.label),
              selected: isSelected,
              onSelected: (_) => onSelected(option.value),
              labelStyle: AppTypography.caption.copyWith(
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              selectedColor: AppColors.primarySoft,
              backgroundColor: AppColors.surface,
              side: BorderSide(
                color: isSelected ? AppColors.primary : AppColors.border,
              ),
              showCheckmark: false,
            ),
          );
        }).toList(),
      ),
    );
  }
}

class FilterChipOption {
  const FilterChipOption({required this.label, required this.value});

  final String label;
  final String? value;
}
