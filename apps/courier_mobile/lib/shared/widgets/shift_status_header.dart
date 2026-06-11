import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class ShiftStatusHeader extends StatelessWidget {
  const ShiftStatusHeader({
    super.key,
    required this.isOnline,
    required this.isLoading,
    required this.onToggle,
  });

  final bool isOnline;
  final bool isLoading;
  final VoidCallback? onToggle;

  @override
  Widget build(BuildContext context) {
    final statusColor = isOnline ? AppColors.online : AppColors.offline;

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: statusColor,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            isOnline ? AppStrings.online : AppStrings.offline,
            style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w700),
          ),
          const Spacer(),
          _ShiftToggleButton(
            isOnline: isOnline,
            isLoading: isLoading,
            onPressed: onToggle,
          ),
        ],
      ),
    );
  }
}

class _ShiftToggleButton extends StatelessWidget {
  const _ShiftToggleButton({
    required this.isOnline,
    required this.isLoading,
    required this.onPressed,
  });

  final bool isOnline;
  final bool isLoading;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isOnline ? AppColors.danger.withValues(alpha: 0.15) : AppColors.primary,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: isLoading ? null : onPressed,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text(
                  isOnline ? AppStrings.endShift : AppStrings.startShift,
                  style: AppTypography.caption.copyWith(
                    color: isOnline ? AppColors.danger : AppColors.onPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
      ),
    );
  }
}
