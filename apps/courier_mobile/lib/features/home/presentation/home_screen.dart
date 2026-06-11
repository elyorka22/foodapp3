import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/compact_order_tile.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/shift_stats_bar.dart';
import '../../home/providers/courier_home_provider.dart';
import '../../orders/data/courier_repository.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String? _actingOrderId;
  bool _shiftLoading = false;
  bool _profileLoaded = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(_loadProfile);
  }

  Future<void> _loadProfile() async {
    await ref.read(courierOnlineProvider.notifier).load();
    if (mounted) setState(() => _profileLoaded = true);
  }

  Future<void> _refresh() async {
    if (!ref.read(shiftSessionOpenProvider)) return;
    ref.invalidate(activeOrderProvider);
    ref.invalidate(availableOrdersProvider);
    ref.invalidate(shiftStatsProvider);
    ref.invalidate(notificationsUnreadProvider);
  }

  Future<void> _startShift() async {
    if (_shiftLoading || ref.read(shiftSessionOpenProvider)) return;
    setState(() => _shiftLoading = true);
    try {
      await ref.read(courierOnlineProvider.notifier).setOnline(true);
      if (!mounted) return;
      ref.read(shiftSessionOpenProvider.notifier).state = true;
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _shiftLoading = false);
    }
  }

  Future<void> _endShift() async {
    if (_shiftLoading || !ref.read(shiftSessionOpenProvider)) return;
    setState(() => _shiftLoading = true);
    try {
      await ref.read(courierOnlineProvider.notifier).setOnline(false);
      if (!mounted) return;
      ref.read(shiftSessionOpenProvider.notifier).state = false;
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _shiftLoading = false);
    }
  }

  Future<void> _acceptOrder(CourierOrderModel order) async {
    if (_actingOrderId != null || !ref.read(shiftSessionOpenProvider)) return;

    setState(() => _actingOrderId = order.id);
    try {
      await ref.read(courierRepositoryProvider).acceptOrder(order.id);
      ref.invalidate(activeOrderProvider);
      ref.invalidate(availableOrdersProvider);
      if (!mounted) return;
      context.push(AppRoutes.activeOrder, extra: order.id);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
      ref.invalidate(availableOrdersProvider);
    } finally {
      if (mounted) setState(() => _actingOrderId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final shiftOpen = ref.watch(shiftSessionOpenProvider);
    final activeOrder = ref.watch(activeOrderProvider);
    final available = ref.watch(availableOrdersProvider);
    final shiftStats = ref.watch(shiftStatsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final hasActiveOrder = activeOrder.valueOrNull != null;
    final shiftBusy = _shiftLoading || !_profileLoaded;

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.appName),
        actions: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.push(AppRoutes.notifications),
              ),
              unread.when(
                data: (count) {
                  if (count <= 0) return const SizedBox.shrink();
                  return Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      child: Text(
                        count > 99 ? '99+' : '$count',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 10),
                      ),
                    ),
                  );
                },
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: !_profileLoaded
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _refresh,
                    child: shiftOpen
                        ? _ShiftWorkZone(
                            activeOrder: activeOrder,
                            available: available,
                            actingOrderId: _actingOrderId,
                            onAccept: _acceptOrder,
                            onOpenActive: (id) =>
                                context.push(AppRoutes.activeOrder, extra: id),
                          )
                        : const _OfflineShiftPrompt(),
                  ),
          ),
          if (_profileLoaded)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.sm,
              ),
              child: FoodAppButton(
                label: shiftOpen ? AppStrings.endShift : AppStrings.startShift,
                variant: shiftOpen
                    ? FoodAppButtonVariant.secondary
                    : FoodAppButtonVariant.primary,
                isLoading: shiftBusy,
                onPressed: shiftBusy || (shiftOpen && hasActiveOrder)
                    ? null
                    : (shiftOpen ? _endShift : _startShift),
              ),
            ),
          shiftStats.when(
            loading: () => const SizedBox(
              height: 72,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (_, __) => const SizedBox.shrink(),
            data: (stats) => ShiftStatsBar(stats: stats),
          ),
        ],
      ),
    );
  }
}

class _OfflineShiftPrompt extends StatelessWidget {
  const _OfflineShiftPrompt();

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.xxl),
      children: [
        const SizedBox(height: 64),
        Icon(Icons.delivery_dining, size: 72, color: AppColors.primary.withValues(alpha: 0.85)),
        const SizedBox(height: AppSpacing.xl),
        Text(
          AppStrings.shiftOfflineHint,
          style: AppTypography.subtitle,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _ShiftWorkZone extends StatelessWidget {
  const _ShiftWorkZone({
    required this.activeOrder,
    required this.available,
    required this.actingOrderId,
    required this.onAccept,
    required this.onOpenActive,
  });

  final AsyncValue<CourierOrderModel?> activeOrder;
  final AsyncValue<List<CourierOrderModel>> available;
  final String? actingOrderId;
  final Future<void> Function(CourierOrderModel order) onAccept;
  final void Function(String orderId) onOpenActive;

  @override
  Widget build(BuildContext context) {
    final active = activeOrder.valueOrNull;

    return available.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const _OrdersEmptyState(message: AppStrings.noAvailableOrders),
      data: (orders) {
        return ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            if (active != null) ...[
              Material(
                color: AppColors.primarySoft,
                borderRadius: BorderRadius.circular(10),
                child: InkWell(
                  onTap: () => onOpenActive(active.id),
                  borderRadius: BorderRadius.circular(10),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    child: Row(
                      children: [
                        const Icon(Icons.local_shipping_outlined, color: AppColors.primary),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            AppStrings.continueDelivery,
                            style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                          ),
                        ),
                        const Icon(Icons.chevron_right, color: AppColors.textMuted),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],
            if (orders.isEmpty)
              const _OrdersEmptyState(message: AppStrings.noAvailableOrders)
            else
              ...orders.map(
                (order) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: CompactOrderTile(
                    order: order,
                    isLoading: actingOrderId == order.id,
                    onAccept: actingOrderId == null ? () => onAccept(order) : null,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _OrdersEmptyState extends StatelessWidget {
  const _OrdersEmptyState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          const Icon(Icons.inbox_outlined, size: 48, color: AppColors.textMuted),
          const SizedBox(height: AppSpacing.md),
          Text(message, style: AppTypography.body, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
