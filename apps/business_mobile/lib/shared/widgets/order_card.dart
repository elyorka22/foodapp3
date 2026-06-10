import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../models/order_model.dart';
import 'food_app_button.dart';

class OrderCard extends StatelessWidget {
  const OrderCard({
    super.key,
    required this.order,
    this.showRestaurant = false,
    this.onStatusChange,
    this.onRequestCourier,
    this.onAssignCourier,
    this.isLoading = false,
  });

  final StaffOrderModel order;
  final bool showRestaurant;
  final void Function(String nextStatus)? onStatusChange;
  final VoidCallback? onRequestCourier;
  final VoidCallback? onAssignCourier;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.decimalPattern('uz');

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('#${order.orderNumber}', style: AppTypography.subtitle),
              ),
              _StatusChip(status: order.status),
            ],
          ),
          if (showRestaurant && order.restaurantName != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(order.restaurantName!, style: AppTypography.bodySmall),
          ],
          if (order.customerPhone != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(order.customerPhone!, style: AppTypography.body),
          ],
          if (order.items.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            ...order.items.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  '${item.quantity}x ${item.name}',
                  style: AppTypography.bodySmall,
                ),
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.sm),
          Text(
            '${formatter.format(order.total)} UZS',
            style: AppTypography.subtitle.copyWith(color: AppColors.primary),
          ),
          if (order.courierRequested) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              AppStrings.courierRequested,
              style: AppTypography.caption.copyWith(color: Colors.amber.shade800),
            ),
          ],
          if (order.courierName != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text('Kuryer: ${order.courierName}', style: AppTypography.bodySmall),
          ],
          const SizedBox(height: AppSpacing.md),
          if (order.canRequestCourier && onRequestCourier != null)
            FoodAppButton(
              label: AppStrings.requestCourier,
              isLoading: isLoading,
              onPressed: isLoading ? null : onRequestCourier,
            ),
          if (order.canAssignCourier && onAssignCourier != null) ...[
            FoodAppButton(
              label: AppStrings.assignCourier,
              isLoading: isLoading,
              onPressed: isLoading ? null : onAssignCourier,
            ),
          ],
          if (order.nextStatus != null && onStatusChange != null) ...[
            if (order.canRequestCourier || order.canAssignCourier)
              const SizedBox(height: AppSpacing.sm),
            FoodAppButton(
              label: '${AppStrings.nextStatus} → ${order.nextStatus}',
              variant: FoodAppButtonVariant.secondary,
              isLoading: isLoading,
              onPressed: isLoading ? null : () => onStatusChange!(order.nextStatus!),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primarySoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(status, style: AppTypography.caption),
    );
  }
}
