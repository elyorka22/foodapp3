import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.status,
    this.label,
  });

  final String status;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final colors = _colorsForStatus(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: colors.border),
      ),
      child: Text(
        label ?? _labelForStatus(status),
        style: AppTypography.caption.copyWith(
          color: colors.foreground,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _StatusColors {
  const _StatusColors({
    required this.background,
    required this.foreground,
    required this.border,
  });

  final Color background;
  final Color foreground;
  final Color border;
}

_StatusColors _colorsForStatus(String status) {
  switch (status) {
    case 'PENDING':
      return const _StatusColors(
        background: AppColors.warningSoft,
        foreground: AppColors.warning,
        border: Color(0xFFFDE68A),
      );
    case 'DELIVERED':
      return const _StatusColors(
        background: AppColors.successSoft,
        foreground: AppColors.success,
        border: Color(0xFFBBF7D0),
      );
    case 'CANCELLED':
      return const _StatusColors(
        background: AppColors.dangerSoft,
        foreground: AppColors.danger,
        border: Color(0xFFFECACA),
      );
    case 'PREPARING':
    case 'ACCEPTED':
    case 'COURIER_ASSIGNED':
    case 'ARRIVED_AT_RESTAURANT':
    case 'PICKED_UP':
    case 'DELIVERING':
      return const _StatusColors(
        background: AppColors.infoSoft,
        foreground: AppColors.info,
        border: Color(0xFFBFDBFE),
      );
    default:
      return const _StatusColors(
        background: AppColors.surfaceMuted,
        foreground: AppColors.textSecondary,
        border: AppColors.border,
      );
  }
}

String _labelForStatus(String status) {
  const labels = {
    'PENDING': 'Kutilmoqda',
    'ACCEPTED': 'Qabul qilindi',
    'PREPARING': 'Tayyorlanmoqda',
    'COURIER_ASSIGNED': 'Kuryer biriktirildi',
    'ARRIVED_AT_RESTAURANT': 'Restoranda',
    'PICKED_UP': 'Olib ketildi',
    'DELIVERING': 'Yetkazilmoqda',
    'DELIVERED': 'Yetkazildi',
    'CANCELLED': 'Bekor qilindi',
  };
  return labels[status] ?? status;
}
