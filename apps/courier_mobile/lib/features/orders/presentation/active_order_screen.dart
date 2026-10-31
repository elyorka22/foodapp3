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
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/call_phone_button.dart';
import '../../../shared/widgets/courier_avatar.dart';
import '../../../shared/widgets/delivery_map.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/order_line_items_card.dart';
import '../../home/providers/courier_home_provider.dart';
import '../data/courier_repository.dart';
import 'order_complete_screen.dart';

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
  bool _showItems = true;
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
        backgroundColor: AppColors.background,
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

    final toCustomer = order.status == 'PICKED_UP' || order.status == 'DELIVERING';
    final activeStop = _activeStop(order);
    final stepLabel = toCustomer
        ? '2 / 2 · ${AppStrings.navigateToCustomer}'
        : '1 / 2 · ${AppStrings.navigateToRestaurant}';
    final heading = toCustomer ? AppStrings.goingToCustomer : AppStrings.goingToRestaurant;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 4, 16, 8),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.chevron_left, size: 28),
                  ),
                  Expanded(
                    child: Text(heading, style: AppTypography.title.copyWith(fontSize: 18)),
                  ),
                  Container(
                    height: 36,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.border),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      stepLabel,
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(0, 4, 0, 12),
                children: [
                  DeliveryMap(
                    expanded: true,
                    courierLat: _courierLat,
                    courierLng: _courierLng,
                    restaurantLat: order.restaurantLat,
                    restaurantLng: order.restaurantLng,
                    customerLat: order.customerLat,
                    customerLng: order.customerLng,
                    orderStatus: order.status,
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(color: AppColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 16,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (toCustomer)
                            _CustomerBlock(order: order, stop: activeStop)
                          else
                            _RestaurantBlock(order: order, stop: activeStop),
                          if (!toCustomer && order.items.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            InkWell(
                              onTap: () => setState(() => _showItems = !_showItems),
                              borderRadius: BorderRadius.circular(10),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                child: Row(
                                  children: [
                                    Text(
                                      'Buyurtma #${order.orderNumber}',
                                      style: AppTypography.subtitle.copyWith(
                                        fontWeight: FontWeight.w800,
                                      ),
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
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceHighlight,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Row(
                                children: [
                                  Text(AppStrings.pickupCode, style: AppTypography.bodySmall),
                                  const Spacer(),
                                  Text(
                                    order.orderNumber,
                                    style: AppTypography.title.copyWith(
                                      fontSize: 22,
                                      letterSpacing: 1.2,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          if (toCustomer) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: AppColors.cashSoft,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: const Color(0x73D68C00),
                                  width: 1.5,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      AppStrings.cashFromCustomer,
                                      style: AppTypography.caption.copyWith(
                                        color: AppColors.warning,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    formatSum(order.collectFromCustomer),
                                    style: AppTypography.subtitle.copyWith(
                                      color: AppColors.warning,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: SafeArea(
                top: false,
                child: _needsAcceptance
                    ? Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: FoodAppButton(
                              label: AppStrings.decline,
                              variant: FoodAppButtonVariant.secondary,
                              isLoading: _acting,
                              onPressed: _acting ? null : _declineAssignment,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            flex: 3,
                            child: FoodAppButton(
                              label: AppStrings.accept,
                              isLoading: _acting,
                              onPressed: _acting ? null : _acceptAssignment,
                            ),
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
        ref.read(lastCompletedDeliveryProvider.notifier).state = CompletedDeliverySummary(
          earnings: order.courierEarnings,
          cashCollected: order.collectFromCustomer,
          orderNumber: order.orderNumber,
        );
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

class _RestaurantBlock extends StatelessWidget {
  const _RestaurantBlock({required this.order, required this.stop});

  final CourierOrderModel order;
  final JobStop? stop;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.surfaceHighlight,
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Icon(Icons.storefront_outlined, color: AppColors.textPrimary),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                stop?.title ?? order.restaurantName ?? '—',
                style: AppTypography.subtitle.copyWith(fontSize: 17),
              ),
              if ((stop?.subtitle ?? '').trim().isNotEmpty ||
                  (order.customerAddress ?? '').isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  stop?.subtitle?.trim().isNotEmpty == true
                      ? stop!.subtitle!
                      : (order.merchantTypeLabel.isNotEmpty
                          ? order.merchantTypeLabel
                          : ''),
                  style: AppTypography.bodySmall,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _CustomerBlock extends StatelessWidget {
  const _CustomerBlock({required this.order, required this.stop});

  final CourierOrderModel order;
  final JobStop? stop;

  @override
  Widget build(BuildContext context) {
    final name = order.customerName ?? stop?.title ?? 'Mijoz';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CourierAvatar(name: name, size: 48),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: AppTypography.subtitle.copyWith(fontSize: 17)),
                  const SizedBox(height: 2),
                  Text(
                    '4,9 · ${AppStrings.customer}',
                    style: AppTypography.caption,
                  ),
                ],
              ),
            ),
            if (stop?.phone != null || order.customerPhone != null)
              CallPhoneButton(
                phone: stop?.phone ?? order.customerPhone!,
                compact: true,
              ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          order.customerAddress ?? stop?.subtitle ?? '—',
          style: AppTypography.body,
        ),
      ],
    );
  }
}
