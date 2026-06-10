import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../../../shared/widgets/info_row.dart';
import '../../../shared/widgets/order_line_items_card.dart';
import '../../home/providers/courier_home_provider.dart';
import '../data/courier_repository.dart';

class IncomingOrderScreen extends ConsumerStatefulWidget {
  const IncomingOrderScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<IncomingOrderScreen> createState() => _IncomingOrderScreenState();
}

class _IncomingOrderScreenState extends ConsumerState<IncomingOrderScreen> {
  CourierOrderModel? _order;
  bool _loading = true;
  bool _acting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      CourierOrderModel? order;
      final available = await ref.read(courierRepositoryProvider).fetchAvailableOrders();
      for (final item in available) {
        if (item.id == widget.orderId) {
          order = item;
          break;
        }
      }
      order ??= await ref.read(courierRepositoryProvider).fetchOrder(widget.orderId);
      if (mounted) setState(() => _order = order);
    } catch (_) {
      if (mounted) setState(() => _order = null);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final order = _order;
    if (order == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(AppStrings.orderUnavailable, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: AppSpacing.lg),
                FoodAppButton(
                  label: AppStrings.backToHome,
                  variant: FoodAppButtonVariant.secondary,
                  onPressed: () => context.go(AppRoutes.home),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.newOrder)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          FoodAppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                InfoRow(label: AppStrings.orderId, value: order.orderNumber),
                InfoRow(label: AppStrings.restaurant, value: order.restaurantName ?? '—'),
                InfoRow(label: AppStrings.address, value: order.customerAddress ?? '—'),
                if (order.distanceKm != null)
                  InfoRow(label: AppStrings.distance, value: '${order.distanceKm} km'),
                InfoRow(
                  label: AppStrings.deliveryFee,
                  value: formatSum(order.courierFee ?? order.deliveryFee),
                ),
                InfoRow(label: AppStrings.total, value: formatSum(order.total)),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          OrderLineItemsCard(items: order.items),
          const SizedBox(height: AppSpacing.xl),
          FoodAppButton(
            label: AppStrings.accept,
            isLoading: _acting,
            onPressed: _accept,
          ),
        ],
      ),
    );
  }

  Future<void> _accept() async {
    setState(() => _acting = true);
    try {
      final online = ref.read(courierOnlineProvider).valueOrNull ?? false;
      if (!online) {
        throw ApiException(message: AppStrings.mustBeOnline);
      }
      await ref.read(courierRepositoryProvider).acceptOrder(widget.orderId);
      ref.invalidate(activeOrderProvider);
      ref.invalidate(availableOrdersProvider);
      if (!mounted) return;
      context.go(AppRoutes.activeOrder, extra: widget.orderId);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }
}
