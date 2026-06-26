import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../../core/utils/phone_dial.dart';
import '../models/order_model.dart';
import 'app_card.dart';
import 'food_app_button.dart';
import 'order_items_list.dart';
import 'status_badge.dart';

class OrderCard extends StatefulWidget {
  const OrderCard({
    super.key,
    required this.order,
    this.showRestaurant = false,
    this.showAssignCourier = true,
    this.restaurantActionsOnly = false,
    this.managerActionsOnly = false,
    this.compact = false,
    this.onStatusChange,
    this.onRequestCourier,
    this.onAssignCourier,
    this.onRemoveCourier,
    this.onCancel,
    this.isLoading = false,
  });

  final StaffOrderModel order;
  final bool showRestaurant;
  final bool showAssignCourier;
  final bool restaurantActionsOnly;
  final bool managerActionsOnly;
  final bool compact;
  final void Function(String nextStatus)? onStatusChange;
  final VoidCallback? onRequestCourier;
  final VoidCallback? onAssignCourier;
  final VoidCallback? onRemoveCourier;
  final VoidCallback? onCancel;
  final bool isLoading;

  @override
  State<OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends State<OrderCard> {
  bool _expanded = false;

  StaffOrderModel get order => widget.order;

  bool get _showDetails => !widget.compact || _expanded;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: widget.compact && !_expanded
          ? const EdgeInsets.all(AppSpacing.md)
          : const EdgeInsets.all(AppSpacing.lg),
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
          if (widget.showRestaurant && order.restaurantName != null) ...[
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
          const SizedBox(height: AppSpacing.sm),
          _AmountBreakdown(order: order),
          if (widget.managerActionsOnly && order.customerPhone != null) ...[
            const SizedBox(height: AppSpacing.sm),
            _CustomerPhoneRow(phone: order.customerPhone!),
          ],
          if (_showDetails) ...[
            if (order.customerPhone != null && !widget.managerActionsOnly) ...[
              const SizedBox(height: AppSpacing.sm),
              _CustomerPhoneRow(phone: order.customerPhone!),
            ],
            if (order.items.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.sm),
              ...order.items.take(3).map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          OrderLineItemQuantity(quantity: item.quantity, compact: true),
                          const SizedBox(width: 6),
                          Expanded(
                            child: OrderLineItemTitle(item: item),
                          ),
                        ],
                      ),
                    ),
                  ),
              if (order.items.length > 3)
                Text(
                  '+${order.items.length - 3} ta',
                  style: AppTypography.caption,
                ),
            ],
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
              if (widget.managerActionsOnly) ...[
                _ManagerOrderActions(
                  order: order,
                  isLoading: widget.isLoading,
                  onAccept: order.canManagerAccept && widget.onStatusChange != null
                      ? () => widget.onStatusChange!('ACCEPTED')
                      : null,
                  onPassToCouriers:
                      order.canPassToCouriers && widget.onRequestCourier != null
                          ? widget.onRequestCourier
                          : null,
                ),
                if (widget.showAssignCourier && order.canReassignCourier && widget.onAssignCourier != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  FoodAppButton(
                    label: AppStrings.reassignCourier,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading ? null : widget.onAssignCourier,
                  ),
                ],
                if (order.canReassignCourier && widget.onRemoveCourier != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  FoodAppButton(
                    label: AppStrings.removeCourier,
                    variant: FoodAppButtonVariant.secondary,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading ? null : widget.onRemoveCourier,
                  ),
                ],
                if (order.canCancel && widget.onCancel != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  FoodAppButton(
                    label: AppStrings.cancelOrder,
                    variant: FoodAppButtonVariant.danger,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading ? null : widget.onCancel,
                  ),
                ],
              ] else if (widget.restaurantActionsOnly)
                _RestaurantOrderActions(
                  order: order,
                  isLoading: widget.isLoading,
                  onAccept: order.canAcceptOrder && widget.onStatusChange != null
                      ? () => widget.onStatusChange!(order.acceptTargetStatus!)
                      : null,
                  onRequestCourier:
                      order.canRequestCourier && widget.onRequestCourier != null
                          ? widget.onRequestCourier
                          : null,
                )
              else ...[
                if (order.canRequestCourier && widget.onRequestCourier != null)
                  FoodAppButton(
                    label: AppStrings.requestCourier,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading ? null : widget.onRequestCourier,
                  ),
                if (widget.showAssignCourier && order.canReassignCourier && widget.onAssignCourier != null) ...[
                  if (order.canRequestCourier) const SizedBox(height: AppSpacing.sm),
                  FoodAppButton(
                    label: AppStrings.reassignCourier,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading ? null : widget.onAssignCourier,
                  ),
                ],
                if (order.canReassignCourier && widget.onRemoveCourier != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  FoodAppButton(
                    label: AppStrings.removeCourier,
                    variant: FoodAppButtonVariant.secondary,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading ? null : widget.onRemoveCourier,
                  ),
                ],
                if (order.nextStatus != null && widget.onStatusChange != null) ...[
                  if (order.canRequestCourier ||
                      (widget.showAssignCourier && order.canReassignCourier))
                    const SizedBox(height: AppSpacing.sm),
                  FoodAppButton(
                    label:
                        '${AppStrings.nextStatus}: ${AppStrings.orderStatusLabel(order.nextStatus!)}',
                    variant: FoodAppButtonVariant.secondary,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading
                        ? null
                        : () => widget.onStatusChange!(order.nextStatus!),
                  ),
                ],
                if (order.canCancel && widget.onCancel != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  FoodAppButton(
                    label: AppStrings.cancelOrder,
                    variant: FoodAppButtonVariant.danger,
                    isLoading: widget.isLoading,
                    onPressed: widget.isLoading ? null : widget.onCancel,
                  ),
                ],
              ],
            ],
          ],
          if (widget.compact) ...[
            const SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () => setState(() => _expanded = !_expanded),
                icon: Icon(
                  _expanded ? Icons.expand_less : Icons.expand_more,
                  size: 18,
                ),
                label: Text(_expanded ? AppStrings.hideDetails : AppStrings.showDetails),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ManagerOrderActions extends StatelessWidget {
  const _ManagerOrderActions({
    required this.order,
    required this.isLoading,
    this.onAccept,
    this.onPassToCouriers,
  });

  final StaffOrderModel order;
  final bool isLoading;
  final VoidCallback? onAccept;
  final VoidCallback? onPassToCouriers;

  @override
  Widget build(BuildContext context) {
    final showAccept = onAccept != null;
    final showPass = onPassToCouriers != null;
    if (!showAccept && !showPass) return const SizedBox.shrink();

    return Row(
      children: [
        if (showAccept)
          Expanded(
            child: FoodAppButton(
              label: AppStrings.acceptOrder,
              compact: true,
              isLoading: isLoading,
              onPressed: isLoading ? null : onAccept,
            ),
          ),
        if (showAccept && showPass) const SizedBox(width: AppSpacing.sm),
        if (showPass)
          Expanded(
            child: FoodAppButton(
              label: AppStrings.passToCouriers,
              compact: true,
              isLoading: isLoading,
              onPressed: isLoading ? null : onPassToCouriers,
            ),
          ),
      ],
    );
  }
}

class _RestaurantOrderActions extends StatelessWidget {
  const _RestaurantOrderActions({
    required this.order,
    required this.isLoading,
    this.onAccept,
    this.onRequestCourier,
  });

  final StaffOrderModel order;
  final bool isLoading;
  final VoidCallback? onAccept;
  final VoidCallback? onRequestCourier;

  @override
  Widget build(BuildContext context) {
    final showAccept = onAccept != null;
    final showCourier = onRequestCourier != null;
    if (!showAccept && !showCourier) return const SizedBox.shrink();

    return Row(
      children: [
        if (showAccept)
          Expanded(
            child: FoodAppButton(
              label: AppStrings.acceptOrder,
              compact: true,
              isLoading: isLoading,
              onPressed: isLoading ? null : onAccept,
            ),
          ),
        if (showAccept && showCourier) const SizedBox(width: AppSpacing.sm),
        if (showCourier)
          Expanded(
            child: FoodAppButton(
              label: AppStrings.requestCourier,
              compact: true,
              isLoading: isLoading,
              onPressed: isLoading ? null : onRequestCourier,
            ),
          ),
      ],
    );
  }
}

class _CustomerPhoneRow extends StatelessWidget {
  const _CustomerPhoneRow({required this.phone});

  final String phone;

  Future<void> _call(BuildContext context) async {
    final ok = await launchPhoneCall(phone);
    if (!context.mounted || ok) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text(AppStrings.callFailed)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.phone_outlined, size: 16, color: AppColors.textMuted),
        const SizedBox(width: 6),
        Expanded(
          child: Text(phone, style: AppTypography.body),
        ),
        const SizedBox(width: 8),
        Material(
          color: AppColors.success,
          borderRadius: BorderRadius.circular(10),
          child: InkWell(
            onTap: () => _call(context),
            borderRadius: BorderRadius.circular(10),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.call, size: 16, color: Colors.white),
                  const SizedBox(width: 6),
                  Text(
                    AppStrings.callCustomer,
                    style: AppTypography.caption.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _AmountBreakdown extends StatelessWidget {
  const _AmountBreakdown({required this.order});

  final StaffOrderModel order;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _AmountTile(
            label: AppStrings.orderAmount,
            value: formatSum(order.itemsTotal),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: _AmountTile(
            label: AppStrings.deliveryAmount,
            value: formatSum(order.deliveryFee),
          ),
        ),
      ],
    );
  }
}

class _AmountTile extends StatelessWidget {
  const _AmountTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 2),
          Text(
            value,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
