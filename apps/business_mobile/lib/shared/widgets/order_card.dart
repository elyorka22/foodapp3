import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/order_model.dart';
import 'app_card.dart';
import 'food_app_button.dart';
import 'status_badge.dart';

class OrderCard extends StatelessWidget {
  const OrderCard({
    super.key,
    required this.order,
    this.showRestaurant = false,
    this.showAssignCourier = true,
    this.onStatusChange,
    this.onRequestCourier,
    this.onAssignCourier,
    this.onCancel,
    this.isLoading = false,
  });

  final StaffOrderModel order;
  final bool showRestaurant;
  final bool showAssignCourier;
  final void Function(String nextStatus)? onStatusChange;
  final VoidCallback? onRequestCourier;
  final VoidCallback? onAssignCourier;
  final VoidCallback? onCancel;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('#${order.orderNumber}', style: AppTypography.subtitle),
              ),
              StatusBadge(status: order.status),
            ],
          ),
          if (showRestaurant && order.restaurantName != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                const Icon(Icons.storefront_outlined, size: 16, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(order.restaurantName!, style: AppTypography.bodySmall),
                ),
              ],
            ),
          ],
          if (order.customerPhone != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                const Icon(Icons.phone_outlined, size: 16, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Text(order.customerPhone!, style: AppTypography.body),
              ],
            ),
          ],
          if (order.items.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            ...order.items.take(3).map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: Text(
                      '${item.quantity}x ${item.name}',
                      style: AppTypography.bodySmall,
                    ),
                  ),
                ),
            if (order.items.length > 3)
              Text(
                '+${order.items.length - 3} ta',
                style: AppTypography.caption,
              ),
          ],
          const SizedBox(height: AppSpacing.md),
          Text(
            formatSum(order.total),
            style: AppTypography.subtitle.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w800,
            ),
          ),
          if (order.courierRequested) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.warningSoft,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.delivery_dining, size: 16, color: AppColors.warning),
                  const SizedBox(width: 6),
                  Text(
                    AppStrings.courierRequested,
                    style: AppTypography.caption.copyWith(color: AppColors.warning),
                  ),
                ],
              ),
            ),
          ],
          if (order.courierName != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text('Kuryer: ${order.courierName}', style: AppTypography.bodySmall),
          ],
          if (!order.isCancelled) ...[
            const SizedBox(height: AppSpacing.md),
            if (order.canRequestCourier && onRequestCourier != null)
              FoodAppButton(
                label: AppStrings.requestCourier,
                isLoading: isLoading,
                onPressed: isLoading ? null : onRequestCourier,
              ),
            if (showAssignCourier && order.canAssignCourier && onAssignCourier != null) ...[
              if (order.canRequestCourier) const SizedBox(height: AppSpacing.sm),
              FoodAppButton(
                label: order.courierId == null
                    ? AppStrings.assignCourier
                    : AppStrings.reassignCourier,
                isLoading: isLoading,
                onPressed: isLoading ? null : onAssignCourier,
              ),
            ],
            if (order.nextStatus != null && onStatusChange != null) ...[
              if (order.canRequestCourier || (showAssignCourier && order.canAssignCourier))
                const SizedBox(height: AppSpacing.sm),
              FoodAppButton(
                label: '${AppStrings.nextStatus}: ${AppStrings.orderStatusLabel(order.nextStatus!)}',
                variant: FoodAppButtonVariant.secondary,
                isLoading: isLoading,
                onPressed: isLoading ? null : () => onStatusChange!(order.nextStatus!),
              ),
            ],
            if (order.canCancel && onCancel != null) ...[
              const SizedBox(height: AppSpacing.sm),
              FoodAppButton(
                label: AppStrings.cancelOrder,
                variant: FoodAppButtonVariant.danger,
                isLoading: isLoading,
                onPressed: isLoading ? null : onCancel,
              ),
            ],
          ],
        ],
      ),
    );
  }
}
