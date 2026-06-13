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
import '../../../shared/widgets/call_phone_button.dart';
import '../../../shared/widgets/delivery_map.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../../../shared/widgets/job_step_indicator.dart';
import '../../../shared/widgets/order_line_items_card.dart';
import '../../../shared/widgets/order_money_summary.dart';
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
    final stops = order.stops;

    return Scaffold(
      appBar: AppBar(
        title: Text('${AppStrings.orderId} #${order.orderNumber}'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ServiceTypeBadge(type: order.serviceType, compact: true),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              color: AppColors.primary,
              child: ListView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                children: [
                  Text(phase, style: AppTypography.title.copyWith(fontSize: 22)),
                  const SizedBox(height: AppSpacing.md),
                  JobStepIndicator(steps: steps),
                  const SizedBox(height: AppSpacing.lg),
                  FoodAppCard(
                    padding: const EdgeInsets.all(14),
                    child: OrderMoneySummary(order: order, showCollectTotal: true),
                  ),
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
                  ...stops.map(
                    (stop) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                      child: FoodAppCard(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: AppColors.primarySoft,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(
                                stop.role == JobStopRole.pickup
                                    ? Icons.storefront_outlined
                                    : Icons.location_on_outlined,
                                color: AppColors.primary,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(stop.roleLabel, style: AppTypography.caption),
                                  Text(stop.title, style: AppTypography.subtitle),
                                  if (stop.subtitle != null)
                                    Text(stop.subtitle!, style: AppTypography.bodySmall),
                                ],
                              ),
                            ),
                            if (stop.phone != null)
                              CallPhoneButton(phone: stop.phone!),
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (order.items.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.sm),
                    OrderLineItemsCard(items: order.items),
                  ],
                ],
              ),
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
