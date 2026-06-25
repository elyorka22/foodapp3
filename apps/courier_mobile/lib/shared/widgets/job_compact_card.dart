import 'package:flutter/material.dart';
import '../../core/jobs/courier_job_adapter.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../models/courier_order_model.dart';
import 'order_money_summary.dart';
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
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: ServiceTypeBadge(type: order.serviceType, compact: true),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      name,
                      style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              OrderMoneySummary(order: order, compact: true),
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
