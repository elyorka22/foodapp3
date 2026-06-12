import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.label,
    required this.value,
    this.icon,
    this.accentColor = AppColors.primary,
  });

  final String label;
  final String value;
  final IconData? icon;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18, color: accentColor),
                const SizedBox(width: 6),
              ],
              Expanded(
                child: Text(label, style: AppTypography.caption),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTypography.subtitle.copyWith(
              fontWeight: FontWeight.w800,
              color: accentColor,
            ),
          ),
        ],
      ),
    );
  }
}
