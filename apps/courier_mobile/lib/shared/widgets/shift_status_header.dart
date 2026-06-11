import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class ShiftStatusHeader extends StatelessWidget {
  const ShiftStatusHeader({
    super.key,
    required this.isOnline,
    required this.isLoading,
    required this.onToggle,
    this.blockedReason,
  });

  final bool isOnline;
  final bool isLoading;
  final VoidCallback? onToggle;
  final String? blockedReason;

  @override
  Widget build(BuildContext context) {
    final statusColor = isOnline ? AppColors.online : AppColors.offline;

    return Container(
      margin: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOnline ? AppColors.online.withValues(alpha: 0.4) : AppColors.border,
        ),
        boxShadow: isOnline ? AppShadows.glowOnline : null,
      ),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: statusColor,
              boxShadow: isOnline
                  ? [BoxShadow(color: statusColor.withValues(alpha: 0.6), blurRadius: 8)]
                  : null,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isOnline ? AppStrings.youAreOnline : AppStrings.youAreOffline,
                  style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w700),
                ),
                Text(
                  isOnline ? AppStrings.waitingOrdersHint : AppStrings.shiftOfflineHint,
                  style: AppTypography.caption,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (blockedReason != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    blockedReason!,
                    style: AppTypography.caption.copyWith(color: AppColors.warning),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
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
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: isLoading ? null : onPressed,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: isLoading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text(
                  isOnline ? AppStrings.endShift : AppStrings.startShift,
                  style: AppTypography.caption.copyWith(
                    color: isOnline ? AppColors.danger : AppColors.onPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
        ),
      ),
    );
  }
}
