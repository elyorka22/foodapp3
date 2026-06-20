import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/order_items_list.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/two_step_cancel_dialog.dart';
import '../../orders/data/orders_repository.dart';
import '../../orders/providers/orders_provider.dart';

class RestaurantOrderDetailScreen extends ConsumerStatefulWidget {
  const RestaurantOrderDetailScreen({
    super.key,
    required this.orderId,
  });

  final String orderId;

  @override
  ConsumerState<RestaurantOrderDetailScreen> createState() =>
      _RestaurantOrderDetailScreenState();
}

class _RestaurantOrderDetailScreenState
    extends ConsumerState<RestaurantOrderDetailScreen> {
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
        data: (order) => _OrderDetailBody(
          order: order,
          acting: _acting,
          onCancel: order.canCancel ? () => _cancelOrder(order.id) : null,
          onRequestCourier:
              order.canRequestCourier ? () => _requestCourier(order.id) : null,
        ),
      ),
    );
  }

  void _invalidateOrders() {
    ref.invalidate(restaurantOrderProvider(widget.orderId));
    ref.invalidate(restaurantAllOrdersPollingProvider);
  }

  Future<void> _requestCourier(String orderId) async {
    setState(() => _acting = true);
    try {
      await ref.read(ordersRepositoryProvider).requestCourier(orderId);
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
            cancelReason: 'Restoran tomonidan bekor qilindi',
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
}

class _OrderDetailBody extends StatelessWidget {
  const _OrderDetailBody({
    required this.order,
    required this.acting,
    this.onCancel,
    this.onRequestCourier,
  });

  final StaffOrderModel order;
  final bool acting;
  final VoidCallback? onCancel;
  final VoidCallback? onRequestCourier;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Row(
          children: [
            StatusBadge(status: order.status),
            const Spacer(),
            Text(
              formatSum(order.itemsTotal),
              style: AppTypography.title.copyWith(
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        if (order.customerPhone != null) ...[
          const SizedBox(height: AppSpacing.md),
          Text(AppStrings.customerPhone, style: AppTypography.caption),
          const SizedBox(height: 4),
          Text(order.customerPhone!, style: AppTypography.body),
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
        _SummaryRow(
          label: AppStrings.orderAmount,
          value: formatSum(order.itemsTotal),
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
        if (onRequestCourier != null) ...[
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FoodAppButton(
              label: AppStrings.requestCourier,
              compact: true,
              isLoading: acting,
              onPressed: acting ? null : onRequestCourier,
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
  });

  final String label;
  final String value;
  final bool emphasized;

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
            color: emphasized ? AppColors.primary : null,
          ),
        ),
      ],
    );
  }
}
