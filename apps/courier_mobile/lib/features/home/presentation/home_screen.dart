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

  Future<void> _setShift(bool online) async {
    if (_shiftLoading) return;
    setState(() => _shiftLoading = true);
    try {
      await ref.read(courierOnlineProvider.notifier).setOnline(online);
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
    final onlineState = ref.watch(courierOnlineProvider);
    final activeOrder = ref.watch(activeOrderProvider);
    final available = ref.watch(availableOrdersProvider);
    final shiftStats = ref.watch(shiftStatsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final isOnline = onlineState.valueOrNull ?? false;
    final hasActiveOrder = activeOrder.valueOrNull != null;

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
            child: RefreshIndicator(
              onRefresh: _refresh,
              child: isOnline
                  ? _ShiftWorkZone(
                      activeOrder: activeOrder,
                      available: available,
                      actingOrderId: _actingOrderId,
                      onAccept: _acceptOrder,
                      onOpenActive: (id) => context.push(AppRoutes.activeOrder, extra: id),
                    )
                  : _OfflineShiftPrompt(
                      isLoading: _shiftLoading || onlineState.isLoading,
                      onStartShift: () => _setShift(true),
                    ),
            ),
          ),
          if (isOnline)
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.sm),
              child: FoodAppButton(
                label: AppStrings.endShift,
                variant: FoodAppButtonVariant.secondary,
                isLoading: _shiftLoading,
                onPressed: hasActiveOrder || _shiftLoading
                    ? null
                    : () => _setShift(false),
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
  const _OfflineShiftPrompt({
    required this.isLoading,
    required this.onStartShift,
  });

  final bool isLoading;
  final VoidCallback onStartShift;

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.xxl),
      children: [
        const SizedBox(height: 48),
        Icon(Icons.delivery_dining, size: 72, color: AppColors.primary.withValues(alpha: 0.85)),
        const SizedBox(height: AppSpacing.xl),
        Text(
          AppStrings.shiftOfflineHint,
          style: AppTypography.subtitle,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xxl),
        FoodAppButton(
          label: AppStrings.startShift,
          isLoading: isLoading,
          onPressed: isLoading ? null : onStartShift,
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
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              AppStrings.availableOrdersTitle,
              style: AppTypography.body.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        ...activeOrder.when(
          loading: () => [
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.lg),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
          ],
          error: (e, _) => [SliverToBoxAdapter(child: Center(child: Text('$e')))],
          data: (active) {
            final slivers = <Widget>[];
            if (active != null) {
              slivers.add(
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 0),
                  sliver: SliverToBoxAdapter(
                    child: Material(
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
                                  AppStrings.activeOrderOpen,
                                  style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                                ),
                              ),
                              const Icon(Icons.chevron_right, color: AppColors.textMuted),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }

            slivers.add(
              available.when(
                loading: () => const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('$e'))),
                data: (orders) {
                  if (orders.isEmpty) {
                    return SliverFillRemaining(
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
                      AppSpacing.lg,
                    ),
                    sliver: SliverList.separated(
                      itemCount: orders.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 6),
                      itemBuilder: (context, index) {
                        final order = orders[index];
                        return CompactOrderTile(
                          order: order,
                          isLoading: actingOrderId == order.id,
                          onAccept: actingOrderId == null ? () => onAccept(order) : null,
                        );
                      },
                    ),
                  );
                },
              ),
            );
            return slivers;
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
            Icon(icon, size: 48, color: AppColors.textMuted),
            const SizedBox(height: AppSpacing.md),
            Text(
              message,
              style: AppTypography.body,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
