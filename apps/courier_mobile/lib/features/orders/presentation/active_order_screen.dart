import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/jobs/courier_job_adapter.dart';
import '../../../core/jobs/job_stop.dart';
import '../../../core/jobs/job_workflow.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/location/courier_location_service.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/active_stop_panel.dart';
import '../../../shared/widgets/delivery_map.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/job_step_indicator.dart';
import '../../../shared/widgets/order_line_items_card.dart';
import '../../../shared/widgets/service_type_badge.dart';
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
  bool _showItems = false;
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
      CourierOrderModel? order;
      try {
        for (final item in await ref.read(courierRepositoryProvider).fetchHomeInbox()) {
          if (item.id == widget.orderId) {
            order = item;
            break;
          }
        }
      } catch (_) {}

      order ??= await ref.read(courierRepositoryProvider).fetchOrder(widget.orderId);

      if (!mounted) return;
      if (order.isPendingOffer && order.status == 'PREPARING') {
        context.go(AppRoutes.incomingOrder, extra: widget.orderId);
        return;
      }
      setState(() => _order = order);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  bool get _needsAcceptance => _order?.needsCourierAcceptance ?? false;

  JobStop? _activeStop(CourierOrderModel order) {
    final stops = order.stops;
    if (stops.isEmpty) return null;

    final toCustomer = order.status == 'PICKED_UP' || order.status == 'DELIVERING';
    if (toCustomer) {
      return stops.firstWhere(
        (stop) => stop.role == JobStopRole.dropoff,
        orElse: () => stops.last,
      );
    }

    return stops.firstWhere(
      (stop) => stop.role == JobStopRole.pickup,
      orElse: () => stops.first,
    );
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

    final steps = JobWorkflow.stepsFor(order);
    final phase = JobWorkflow.phaseLabel(order);
    final activeStop = _activeStop(order);

    return Scaffold(
      appBar: AppBar(
        title: Text('#${order.orderNumber}', style: AppTypography.subtitle),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ServiceTypeBadge(type: order.serviceType, compact: true),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(phase, style: AppTypography.title.copyWith(fontSize: 20)),
                const SizedBox(height: 8),
                JobStepIndicator(steps: steps),
              ],
            ),
          ),
          Expanded(
            child: DeliveryMap(
              expanded: true,
              courierLat: _courierLat,
              courierLng: _courierLng,
              restaurantLat: order.restaurantLat,
              restaurantLng: order.restaurantLng,
              customerLat: order.customerLat,
              customerLng: order.customerLng,
              orderStatus: order.status,
            ),
          ),
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              color: AppColors.background,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (activeStop != null)
                  ActiveStopPanel(stop: activeStop, order: order),
                if (order.items.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () => setState(() => _showItems = !_showItems),
                    borderRadius: BorderRadius.circular(10),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          Text(
                            'Buyurtma tarkibi (${order.items.length})',
                            style: AppTypography.bodySmall,
                          ),
                          const Spacer(),
                          Icon(
                            _showItems ? Icons.expand_less : Icons.expand_more,
                            size: 20,
                            color: AppColors.textMuted,
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_showItems) OrderLineItemsCard(items: order.items),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              top: false,
              child: _needsAcceptance
                  ? Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        FoodAppButton(
                          label: AppStrings.accept,
                          isLoading: _acting,
                          onPressed: _acting ? null : _acceptAssignment,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        FoodAppButton(
                          label: AppStrings.decline,
                          variant: FoodAppButtonVariant.secondary,
                          isLoading: _acting,
                          onPressed: _acting ? null : _declineAssignment,
                        ),
                      ],
                    )
                  : FoodAppButton(
                      label: JobWorkflow.actionLabel(order),
                      isLoading: _acting,
                      onPressed: _acting ? null : _onAction,
                    ),
            ),
          ),
        ],
      ),
    );
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
        dismissHomeJobOffer(ref, order.id);
        ref.invalidate(activeOrderProvider);
        ref.invalidate(homeInboxProvider);
        ref.invalidate(courierEarningsProvider);
        ref.invalidate(shiftStatsProvider);
        ref.invalidate(courierProfileProvider);
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
