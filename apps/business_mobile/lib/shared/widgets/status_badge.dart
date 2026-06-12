import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final colors = _colorsFor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        AppStrings.orderStatusLabel(status),
        style: AppTypography.caption.copyWith(
          color: colors.foreground,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  _BadgeColors _colorsFor(String status) {
    switch (status) {
      case 'PENDING':
        return const _BadgeColors(AppColors.warningSoft, AppColors.warning);
      case 'ACCEPTED':
      case 'PREPARING':
        return const _BadgeColors(AppColors.infoSoft, AppColors.info);
      case 'COURIER_ASSIGNED':
      case 'ARRIVED_AT_RESTAURANT':
      case 'PICKED_UP':
      case 'DELIVERING':
        return const _BadgeColors(AppColors.primarySoft, AppColors.primary);
      case 'DELIVERED':
        return const _BadgeColors(AppColors.successSoft, AppColors.success);
      case 'CANCELLED':
        return const _BadgeColors(AppColors.dangerSoft, AppColors.danger);
      default:
        return const _BadgeColors(AppColors.surfaceMuted, AppColors.textSecondary);
    }
  }
}

class _BadgeColors {
  const _BadgeColors(this.background, this.foreground);
  final Color background;
  final Color foreground;
}
