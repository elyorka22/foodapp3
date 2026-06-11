import 'package:flutter/material.dart';
import '../../core/jobs/courier_job_adapter.dart';
import '../../core/jobs/job_workflow.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_order_model.dart';
import 'service_type_badge.dart';

class ActiveJobHero extends StatelessWidget {
  const ActiveJobHero({
    super.key,
    required this.order,
    required this.onOpen,
  });

  final CourierOrderModel order;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final phase = JobWorkflow.phaseLabel(order);
    final pickup = order.stops.first;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A3D35), Color(0xFF151B24)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.35)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onOpen,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    ServiceTypeBadge(type: order.serviceType, compact: true),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        AppStrings.activeDelivery,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(phase, style: AppTypography.title.copyWith(fontSize: 20)),
                const SizedBox(height: 4),
                Text(
                  pickup.title,
                  style: AppTypography.body.copyWith(color: AppColors.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Text(
                      formatSum(order.initialDeliveryFee),
                      style: AppTypography.subtitle.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      AppStrings.activeJobOpen,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: AppColors.primary, size: 20),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
