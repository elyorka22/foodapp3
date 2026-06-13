import 'package:flutter/material.dart';
import '../../core/jobs/job_stop.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_order_model.dart';
import 'call_phone_button.dart';

/// Current pickup/dropoff target for the active delivery screen.
class ActiveStopPanel extends StatelessWidget {
  const ActiveStopPanel({
    super.key,
    required this.stop,
    required this.order,
  });

  final JobStop stop;
  final CourierOrderModel order;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  stop.role == JobStopRole.pickup
                      ? Icons.storefront_outlined
                      : Icons.location_on_outlined,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(stop.roleLabel, style: AppTypography.caption),
                    const SizedBox(height: 2),
                    Text(
                      stop.title,
                      style: AppTypography.subtitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (stop.subtitle != null && stop.subtitle!.trim().isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        stop.subtitle!,
                        style: AppTypography.bodySmall,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              if (stop.phone != null)
                CallPhoneButton(phone: stop.phone!, compact: true),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _MoneyChip(
                  label: 'Restoran',
                  value: order.orderAmount,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _MoneyChip(
                  label: 'Mijozdan',
                  value: order.collectFromCustomer,
                  emphasized: true,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _MoneyChip(
                  label: 'Daromad',
                  value: order.courierEarnings,
                  valueColor: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MoneyChip extends StatelessWidget {
  const _MoneyChip({
    required this.label,
    required this.value,
    this.emphasized = false,
    this.valueColor,
  });

  final String label;
  final num value;
  final bool emphasized;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption, maxLines: 1),
          const SizedBox(height: 2),
          Text(
            formatSum(value),
            style: (emphasized ? AppTypography.body : AppTypography.bodySmall).copyWith(
              fontWeight: FontWeight.w800,
              color: valueColor,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
