import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/location/courier_location_service.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/call_phone_button.dart';
import '../../../shared/widgets/delivery_map.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../../../shared/widgets/info_row.dart';
import '../../../shared/widgets/order_line_items_card.dart';
import '../../home/providers/courier_home_provider.dart';
import '../data/courier_repository.dart';

class ActiveOrderScreen extends ConsumerStatefulWidget {
  const ActiveOrderScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<ActiveOrderScreen> createState() => _ActiveOrderScreenState();
}

class _ActiveOrderScreenState extends ConsumerState<ActiveOrderScreen> {
  CourierOrderModel? _order;
  bool _loading = true;
  bool _acting = false;
  double? _courierLat;
  double? _courierLng;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await Future.wait([_load(), _loadCourierPosition()]);
  }

  Future<void> _loadCourierPosition() async {
    final pos = await CourierLocationService().getCurrentPosition();
    if (!mounted || pos == null) return;
    setState(() {
      _courierLat = pos.latitude;
      _courierLng = pos.longitude;
    });
    await ref.read(courierRepositoryProvider).updateLocation(pos.latitude, pos.longitude);
  }

  Future<void> _load() async {
    try {
      final order = await ref.read(courierRepositoryProvider).fetchOrder(widget.orderId);
      if (mounted) setState(() => _order = order);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  bool get _needsAcceptance => _order?.needsCourierAcceptance ?? false;

  String get _actionLabel {
    final status = _order?.status;
    if (_needsAcceptance) return AppStrings.accept;
    if (status == 'COURIER_ASSIGNED') return AppStrings.arrivedAtRestaurant;
    if (status == 'ARRIVED_AT_RESTAURANT') return AppStrings.pickedUp;
    if (status == 'PICKED_UP') return AppStrings.delivered;
    if (status == 'DELIVERING') return AppStrings.delivered;
    return AppStrings.openOrder;
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
                Text(AppStrings.orderUnavailable, style: AppTypography.subtitle),
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
      appBar: AppBar(title: Text('${AppStrings.orderId} ${order.orderNumber}')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            FoodAppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(_statusLabel(order.status), style: AppTypography.subtitle),
                  const SizedBox(height: AppSpacing.md),
                  InfoRow(label: AppStrings.restaurant, value: order.restaurantName ?? '—'),
                  InfoRow(label: AppStrings.customer, value: order.customerPhone ?? '—'),
                  InfoRow(label: AppStrings.address, value: order.customerAddress ?? '—'),
                  if (order.customerPhone != null)
                    CallPhoneButton(phone: order.customerPhone!),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            OrderLineItemsCard(items: order.items),
            const SizedBox(height: AppSpacing.lg),
            DeliveryMap(
              courierLat: _courierLat,
              courierLng: _courierLng,
              restaurantLat: order.restaurantLat,
              restaurantLng: order.restaurantLng,
              customerLat: order.customerLat,
              customerLng: order.customerLng,
            ),
            const SizedBox(height: AppSpacing.lg),
            if (_needsAcceptance) ...[
              FoodAppButton(
                label: AppStrings.accept,
                isLoading: _acting,
                onPressed: _acting ? null : _acceptAssignment,
              ),
              const SizedBox(height: AppSpacing.md),
              FoodAppButton(
                label: AppStrings.decline,
                variant: FoodAppButtonVariant.secondary,
                isLoading: _acting,
                onPressed: _acting ? null : _declineAssignment,
              ),
            ] else
              FoodAppButton(
                label: _actionLabel,
                isLoading: _acting,
                onPressed: _acting ? null : _onAction,
              ),
          ],
        ),
      ),
    );
  }

  String _statusLabel(String status) {
    if (_needsAcceptance) return 'Yangi buyurtma biriktirildi';
    switch (status) {
      case 'COURIER_ASSIGNED':
        return 'Restoranga yo\'l';
      case 'ARRIVED_AT_RESTAURANT':
        return 'Buyurtmani olish';
      case 'PICKED_UP':
      case 'DELIVERING':
        return 'Mijozga yetkazish';
      default:
        return status;
    }
  }

  Future<void> _acceptAssignment() async {
    final order = _order;
    if (order == null) return;
    setState(() => _acting = true);
    try {
      final updated = await ref.read(courierRepositoryProvider).acceptOrder(order.id);
      setState(() => _order = updated);
      ref.invalidate(activeOrderProvider);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _declineAssignment() async {
    final order = _order;
    if (order == null) return;
    setState(() => _acting = true);
    try {
      await ref.read(courierRepositoryProvider).declineOrder(order.id);
      ref.invalidate(activeOrderProvider);
      if (!mounted) return;
      context.go(AppRoutes.home);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _onAction() async {
    final order = _order;
    if (order == null) return;
    setState(() => _acting = true);
    try {
      if (order.status == 'COURIER_ASSIGNED') {
        final updated = await ref
            .read(courierRepositoryProvider)
            .updateStatus(order.id, 'ARRIVED_AT_RESTAURANT');
        setState(() => _order = updated);
        return;
      }
      if (order.status == 'ARRIVED_AT_RESTAURANT') {
        var updated = await ref.read(courierRepositoryProvider).updateStatus(order.id, 'PICKED_UP');
        updated = await ref.read(courierRepositoryProvider).updateStatus(updated.id, 'DELIVERING');
        setState(() => _order = updated);
        return;
      }
      if (order.status == 'PICKED_UP') {
        final updated = await ref.read(courierRepositoryProvider).updateStatus(order.id, 'DELIVERING');
        setState(() => _order = updated);
        return;
      }
      if (order.status == 'DELIVERING') {
        await ref.read(courierRepositoryProvider).updateStatus(order.id, 'DELIVERED');
        ref.invalidate(activeOrderProvider);
        ref.invalidate(courierEarningsProvider);
        if (!mounted) return;
        context.go(AppRoutes.orderComplete);
      }
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }
}
