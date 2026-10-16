import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class SummaryCard extends StatelessWidget {
  const SummaryCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.isPlaceholder = true,
    this.onTap,
  });

  final String title;
  final String value;
  final IconData icon;
  final bool isPlaceholder;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        side: const BorderSide(color: AppColors.border),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: AppColors.primary, size: 22),
                  ),
                  const Spacer(),
                  if (isPlaceholder)
                    Text(
                      '—',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                value,
                style: AppTypography.title.copyWith(
                  color: isPlaceholder ? AppColors.placeholder : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(title, style: AppTypography.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}
