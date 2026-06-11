import 'package:flutter/material.dart';
import '../../core/jobs/courier_job_adapter.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_order_model.dart';
import 'service_type_badge.dart';

/// Minimal job row: service type, establishment name, delivery fee.
class JobCompactCard extends StatelessWidget {
  const JobCompactCard({
    super.key,
    required this.order,
    required this.onTap,
    this.trailing,
  });

  final CourierOrderModel order;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final name = order.restaurantName ?? order.stops.first.title;

    return Material(
      color: AppColors.surfaceElevated,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Row(
            children: [
              ServiceTypeBadge(type: order.serviceType, compact: true),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  name,
                  style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                formatSum(order.initialDeliveryFee),
                style: AppTypography.subtitle.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: 8),
                trailing!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
