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
import '../../../shared/widgets/courier_order_card.dart';
import '../../../shared/widgets/shift_stats_bar.dart';
import '../../home/providers/courier_home_provider.dart';
import '../../orders/courier_order_actions.dart';
import '../../orders/data/courier_repository.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String? _actingOrderId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(courierOnlineProvider.notifier).load());
  }

  Future<void> _refresh() async {
    ref.invalidate(activeOrderProvider);
    ref.invalidate(availableOrdersProvider);
    ref.invalidate(shiftStatsProvider);
    ref.invalidate(notificationsUnreadProvider);
  }

  Future<void> _handleOrderAction(
    CourierOrderModel order, {
    required bool isAvailable,
  }) async {
    if (_actingOrderId != null) return;

    final online = ref.read(courierOnlineProvider).valueOrNull ?? false;
    if (!online) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.mustBeOnline)),
      );
      return;
    }

    setState(() => _actingOrderId = order.id);
    try {
      final repo = ref.read(courierRepositoryProvider);

      if (shouldAcceptOrder(order, isAvailable: isAvailable)) {
        await repo.acceptOrder(order.id);
        ref.invalidate(activeOrderProvider);
        ref.invalidate(availableOrdersProvider);
        return;
      }

      final next = nextStatusForOrder(order);
      if (next == null) {
        if (!mounted) return;
        context.push(AppRoutes.activeOrder, extra: order.id);
        return;
      }

      if (next == 'PICKED_UP_THEN_DELIVERING') {
        var updated = await repo.updateStatus(order.id, 'PICKED_UP');
        await repo.updateStatus(updated.id, 'DELIVERING');
      } else if (next == 'DELIVERED') {
        await repo.updateStatus(order.id, 'DELIVERED');
        ref.invalidate(activeOrderProvider);
        ref.invalidate(availableOrdersProvider);
        ref.invalidate(shiftStatsProvider);
        if (!mounted) return;
        context.push(AppRoutes.orderComplete);
      } else {
        await repo.updateStatus(order.id, next);
        ref.invalidate(activeOrderProvider);
      }
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
      ref.invalidate(availableOrdersProvider);
      ref.invalidate(activeOrderProvider);
    } finally {
      if (mounted) setState(() => _actingOrderId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final onlineState = ref.watch(courierOnlineProvider);
    final activeOrder = ref.watch(activeOrderProvider);
    final available = ref.watch(availableOrdersProvider);
    final shiftStats = ref.watch(shiftStatsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final isOnline = onlineState.valueOrNull ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.appName),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isOnline ? AppStrings.online : AppStrings.offline,
                  style: AppTypography.caption.copyWith(
                    color: isOnline ? AppColors.success : AppColors.textMuted,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Switch(
                  value: isOnline,
                  activeTrackColor: AppColors.primarySoft,
                  thumbColor: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return AppColors.primary;
                    }
                    return null;
                  }),
                  onChanged: onlineState.isLoading
                      ? null
                      : (v) => ref.read(courierOnlineProvider.notifier).setOnline(v),
                ),
              ],
            ),
          ),
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
            child: RefreshIndicator(
              onRefresh: _refresh,
              child: _OrdersPanel(
                isOnline: isOnline,
                activeOrder: activeOrder,
                available: available,
                actingOrderId: _actingOrderId,
                onOrderAction: _handleOrderAction,
              ),
            ),
          ),
          shiftStats.when(
            loading: () => const SizedBox(
              height: 120,
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

class _OrdersPanel extends StatelessWidget {
  const _OrdersPanel({
    required this.isOnline,
    required this.activeOrder,
    required this.available,
    required this.actingOrderId,
    required this.onOrderAction,
  });

  final bool isOnline;
  final AsyncValue<CourierOrderModel?> activeOrder;
  final AsyncValue<List<CourierOrderModel>> available;
  final String? actingOrderId;
  final Future<void> Function(CourierOrderModel order, {required bool isAvailable})
      onOrderAction;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            width: double.infinity,
            margin: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.sm,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(
              AppStrings.availableOrdersTitle,
              style: AppTypography.subtitle.copyWith(color: Colors.white),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        if (!isOnline)
          SliverFillRemaining(
            hasScrollBody: false,
            child: _EmptyOrdersMessage(
              message: AppStrings.goOnlineToSeeOrders,
              icon: Icons.power_settings_new,
            ),
          )
        else
          activeOrder.when(
            loading: () => const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('$e'))),
            data: (active) {
              if (active != null) {
                return SliverPadding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      CourierOrderCard(
                        order: active,
                        mode: CourierOrderCardMode.active,
                        isActiveHighlight: true,
                        isLoading: actingOrderId == active.id,
                        actionLabel: actionLabelForOrder(active, isAvailable: false),
                        onAction: actingOrderId == null
                            ? () => onOrderAction(active, isAvailable: false)
                            : null,
                      ),
                    ]),
                  ),
                );
              }

              return available.when(
                loading: () => const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('$e'))),
                data: (orders) {
                  if (orders.isEmpty) {
                    return const SliverFillRemaining(
                      hasScrollBody: false,
                      child: _EmptyOrdersMessage(
                        message: AppStrings.noAvailableOrders,
                        icon: Icons.inbox_outlined,
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.lg,
                      AppSpacing.sm,
                      AppSpacing.lg,
                      AppSpacing.xxxl,
                    ),
                    sliver: SliverList.separated(
                      itemCount: orders.length,
                      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
                      itemBuilder: (context, index) {
                        final order = orders[index];
                        return CourierOrderCard(
                          order: order,
                          mode: CourierOrderCardMode.available,
                          isLoading: actingOrderId == order.id,
                          actionLabel: actionLabelForOrder(order, isAvailable: true),
                          onAction: actingOrderId == null
                              ? () => onOrderAction(order, isAvailable: true)
                              : null,
                        );
                      },
                    ),
                  );
                },
              );
            },
          ),
      ],
    );
  }
}

class _EmptyOrdersMessage extends StatelessWidget {
  const _EmptyOrdersMessage({required this.message, required this.icon});

  final String message;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: AppColors.textMuted),
            const SizedBox(height: AppSpacing.lg),
            Text(
              message,
              style: AppTypography.subtitle,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
