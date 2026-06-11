import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_shift_stats_model.dart';

class ShiftStatsBar extends StatelessWidget {
  const ShiftStatsBar({super.key, required this.stats});

  final CourierShiftStatsModel stats;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.lg,
        AppSpacing.lg,
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: _StatTile(
                icon: Icons.check_circle_outline,
                label: AppStrings.shiftDeliveries,
                value: '${stats.todayDeliveries}',
              ),
            ),
            Container(width: 1, height: 36, color: AppColors.border),
            Expanded(
              child: _StatTile(
                icon: Icons.payments_outlined,
                label: AppStrings.shiftEarnings,
                value: formatSum(stats.todayEarnings),
                accent: true,
              ),
            ),
            Container(width: 1, height: 36, color: AppColors.border),
            Expanded(
              child: _StatTile(
                icon: Icons.star_outline,
                label: AppStrings.todayBonuses,
                value: formatSum(stats.todayBonuses),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.label,
    required this.value,
    this.accent = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Column(
        children: [
          Icon(icon, size: 16, color: accent ? AppColors.primary : AppColors.textMuted),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.body.copyWith(
              color: accent ? AppColors.primary : AppColors.textPrimary,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            label,
            style: AppTypography.caption,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
