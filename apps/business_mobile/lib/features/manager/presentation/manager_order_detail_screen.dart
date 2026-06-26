import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../core/utils/phone_dial.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/order_items_list.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/two_step_cancel_dialog.dart';
import '../../manager/data/couriers_repository.dart';
import '../../orders/data/orders_repository.dart';
import '../../orders/providers/orders_provider.dart';

class ManagerOrderDetailScreen extends ConsumerStatefulWidget {
  const ManagerOrderDetailScreen({
    super.key,
    required this.orderId,
  });

  final String orderId;

  @override
  ConsumerState<ManagerOrderDetailScreen> createState() =>
      _ManagerOrderDetailScreenState();
}

class _ManagerOrderDetailScreenState extends ConsumerState<ManagerOrderDetailScreen> {
  bool _acting = false;

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(restaurantOrderProvider(widget.orderId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: orderAsync.maybeWhen(
          data: (order) => Text('#${order.orderNumber}'),
          orElse: () => const Text(AppStrings.orders),
        ),
      ),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Text(ApiException.formatError(e), textAlign: TextAlign.center),
          ),
        ),
        data: (order) => _ManagerOrderDetailBody(
          order: order,
          acting: _acting,
          onAccept: order.canManagerAccept ? () => _accept(order.id) : null,
          onPassToCouriers:
              order.canPassToCouriers ? () => _passToCouriers(order.id, order.status) : null,
          onReassignCourier:
              order.canReassignCourier ? () => _showReassignDialog(order) : null,
          onRemoveCourier:
              order.canReassignCourier ? () => _removeCourier(order.id) : null,
          onCancel: order.canCancel ? () => _cancelOrder(order.id) : null,
        ),
      ),
    );
  }

  void _invalidateOrders() {
    ref.invalidate(restaurantOrderProvider(widget.orderId));
    ref.invalidate(managerOpenOrdersPollingProvider);
    ref.invalidate(managerClosedOrdersPollingProvider);
  }

  Future<void> _accept(String orderId) async {
    setState(() => _acting = true);
    try {
      await ref.read(ordersRepositoryProvider).updateStatus(orderId, 'ACCEPTED');
      _invalidateOrders();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _passToCouriers(String orderId, String currentStatus) async {
    setState(() => _acting = true);
    try {
      final repo = ref.read(ordersRepositoryProvider);
      if (currentStatus == 'ACCEPTED') {
        await repo.updateStatus(orderId, 'PREPARING');
      }
      await repo.requestCourier(orderId);
      _invalidateOrders();
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _cancelOrder(String orderId) async {
    final confirmed = await confirmOrderCancellation(context);
    if (!confirmed || !mounted) return;

    setState(() => _acting = true);
    try {
      await ref.read(ordersRepositoryProvider).updateStatus(
            orderId,
            'CANCELLED',
            cancelReason: 'Menejer tomonidan bekor qilindi',
          );
      _invalidateOrders();
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _removeCourier(String orderId) async {
    setState(() => _acting = true);
    try {
      await ref.read(ordersRepositoryProvider).removeCourier(orderId);
      _invalidateOrders();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _showReassignDialog(StaffOrderModel order) async {
    try {
      final couriers = await ref.read(couriersRepositoryProvider).fetchCouriers();
      if (!mounted) return;

      final active = couriers.where((c) => c.isActive).toList();
      if (active.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppStrings.noOnlineCouriers)),
        );
        return;
      }

      final selected = await showModalBottomSheet<String>(
        context: context,
        showDragHandle: true,
        builder: (context) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Text(AppStrings.selectCourier, style: AppTypography.subtitle),
                ),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: active.length,
                    itemBuilder: (context, index) {
                      final courier = active[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primarySoft,
                          child: Text(courier.fullName.characters.first),
                        ),
                        title: Text(courier.fullName),
                        subtitle: Text(courier.phone ?? ''),
                        trailing: Icon(
                          Icons.circle,
                          color: courier.isOnline ? AppColors.success : AppColors.textMuted,
                          size: 10,
                        ),
                        onTap: () => Navigator.pop(context, courier.id),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      );

      if (selected == null) return;
      setState(() => _acting = true);
      await ref.read(ordersRepositoryProvider).reassignCourier(order.id, selected);
      _invalidateOrders();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }
}

class _ManagerOrderDetailBody extends StatelessWidget {
  const _ManagerOrderDetailBody({
    required this.order,
    required this.acting,
    this.onAccept,
    this.onPassToCouriers,
    this.onReassignCourier,
    this.onRemoveCourier,
    this.onCancel,
  });

  final StaffOrderModel order;
  final bool acting;
  final VoidCallback? onAccept;
  final VoidCallback? onPassToCouriers;
  final VoidCallback? onReassignCourier;
  final VoidCallback? onRemoveCourier;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: scrollSafePadding(
        context,
        base: const EdgeInsets.all(AppSpacing.lg),
      ),
      children: [
        Row(
          children: [
            StatusBadge(status: order.status),
            const Spacer(),
            Text(
              formatSum(order.total),
              style: AppTypography.title.copyWith(
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        if (order.restaurantName != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(AppStrings.restaurantName, style: AppTypography.caption),
          const SizedBox(height: 4),
          Text(order.restaurantName!, style: AppTypography.body),
        ],
        if (order.customerPhone != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(AppStrings.customerPhone, style: AppTypography.caption),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(child: Text(order.customerPhone!, style: AppTypography.body)),
              IconButton(
                onPressed: () => launchPhoneCall(order.customerPhone!),
                icon: const Icon(Icons.phone_outlined, color: AppColors.primary),
                tooltip: AppStrings.callCustomer,
              ),
            ],
          ),
        ],
        if (order.courierName != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(AppStrings.couriers, style: AppTypography.caption),
          const SizedBox(height: 4),
          Text(order.courierName!, style: AppTypography.body),
        ],
        const SizedBox(height: AppSpacing.lg),
        Text(AppStrings.menu, style: AppTypography.subtitle),
        const SizedBox(height: AppSpacing.sm),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: OrderItemsList(items: order.items),
        ),
        const SizedBox(height: AppSpacing.md),
        _SummaryRow(label: AppStrings.orderAmount, value: formatSum(order.subtotal > 0 ? order.subtotal : order.itemsTotal)),
        if (order.discountAmount > 0) ...[
          const SizedBox(height: AppSpacing.sm),
          _SummaryRow(
            label: AppStrings.promoDiscount,
            value: '-${formatSum(order.discountAmount)}',
            valueColor: AppColors.success,
          ),
        ],
        if (order.deliveryFee > 0) ...[
          const SizedBox(height: AppSpacing.sm),
          _SummaryRow(label: AppStrings.deliveryAmount, value: formatSum(order.deliveryFee)),
        ],
        const SizedBox(height: AppSpacing.sm),
        _SummaryRow(
          label: AppStrings.orderTotal,
          value: formatSum(order.total),
          emphasized: true,
        ),
        if (order.courierRequested) ...[
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.warningSoft,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.delivery_dining, color: AppColors.warning, size: 18),
                const SizedBox(width: 8),
                Text(
                  AppStrings.courierRequested,
                  style: AppTypography.bodySmall.copyWith(color: AppColors.warning),
                ),
              ],
            ),
          ),
        ],
        if (onAccept != null) ...[
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FoodAppButton(
              label: AppStrings.acceptOrder,
              compact: true,
              isLoading: acting,
              onPressed: acting ? null : onAccept,
            ),
          ),
        ],
        if (onPassToCouriers != null) ...[
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FoodAppButton(
              label: AppStrings.passToCouriers,
              compact: true,
              isLoading: acting,
              onPressed: acting ? null : onPassToCouriers,
            ),
          ),
        ],
        if (onReassignCourier != null) ...[
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            width: double.infinity,
            child: FoodAppButton(
              label: AppStrings.reassignCourier,
              variant: FoodAppButtonVariant.secondary,
              compact: true,
              isLoading: acting,
              onPressed: acting ? null : onReassignCourier,
            ),
          ),
        ],
        if (onRemoveCourier != null) ...[
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            width: double.infinity,
            child: FoodAppButton(
              label: AppStrings.removeCourier,
              variant: FoodAppButtonVariant.secondary,
              compact: true,
              isLoading: acting,
              onPressed: acting ? null : onRemoveCourier,
            ),
          ),
        ],
        if (onCancel != null) ...[
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            width: double.infinity,
            child: FoodAppButton(
              label: AppStrings.cancelOrder,
              variant: FoodAppButtonVariant.danger,
              compact: true,
              isLoading: acting,
              onPressed: acting ? null : onCancel,
            ),
          ),
        ],
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.emphasized = false,
    this.valueColor,
  });

  final String label;
  final String value;
  final bool emphasized;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final style = emphasized ? AppTypography.subtitle : AppTypography.bodySmall;
    return Row(
      children: [
        Expanded(child: Text(label, style: style)),
        Text(
          value,
          style: style.copyWith(
            fontWeight: emphasized ? FontWeight.w800 : FontWeight.w600,
            color: valueColor ?? (emphasized ? AppColors.primary : null),
          ),
        ),
      ],
    );
  }
}
