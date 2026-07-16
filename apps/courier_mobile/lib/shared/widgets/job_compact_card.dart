import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
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
    this.highlight = false,
  });

  final CourierOrderModel order;
  final VoidCallback? onTap;
  final Widget? trailing;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final name = order.restaurantName ?? order.stops.first.title;

    return Material(
      color: highlight ? AppColors.surfaceHighlight : AppColors.surfaceElevated,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: highlight
                  ? AppColors.primary.withValues(alpha: 0.45)
                  : AppColors.borderLight,
            ),
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
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      name,
                      style: AppTypography.merchantName,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              OrderMoneySummary(order: order, compact: true),
              if (trailing != null) ...[
                const SizedBox(width: AppSpacing.sm),
                trailing!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
