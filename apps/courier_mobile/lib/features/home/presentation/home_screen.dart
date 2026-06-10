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

  Future<void> _toggleShift(bool online) async {
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
    ref.listen(activeOrderProvider, (previous, next) {
      final wasActive = previous?.valueOrNull;
      final nowActive = next.valueOrNull;
      if (wasActive == null && nowActive != null && mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            context.push(AppRoutes.activeOrder, extra: nowActive.id);
          }
        });
      }
    });

    final onlineState = ref.watch(courierOnlineProvider);
    final activeOrder = ref.watch(activeOrderProvider);
    final available = ref.watch(availableOrdersProvider);
    final shiftStats = ref.watch(shiftStatsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final isOnline = onlineState.valueOrNull ?? false;
    final hasActiveOrder = activeOrder.valueOrNull != null;
    final shiftBusy = _shiftLoading || onlineState.isLoading;

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
                    )
                  : const _OfflineShiftPrompt(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.sm),
            child: FoodAppButton(
              label: isOnline ? AppStrings.endShift : AppStrings.startShift,
              variant: isOnline ? FoodAppButtonVariant.secondary : FoodAppButtonVariant.primary,
              isLoading: shiftBusy,
              onPressed: shiftBusy || (isOnline && hasActiveOrder)
                  ? null
                  : () => _toggleShift(!isOnline),
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
  });

  final AsyncValue<CourierOrderModel?> activeOrder;
  final AsyncValue<List<CourierOrderModel>> available;
  final String? actingOrderId;
  final Future<void> Function(CourierOrderModel order) onAccept;

  @override
  Widget build(BuildContext context) {
    return activeOrder.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('$e')),
      data: (active) {
        if (active != null) {
          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: const [
              SizedBox(height: 120),
              Center(child: Text(AppStrings.waitingForOrders)),
            ],
          );
        }

        return available.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('$e')),
          data: (orders) {
            if (orders.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 120),
                  _EmptyOrdersMessage(
                    message: AppStrings.noAvailableOrders,
                    icon: Icons.inbox_outlined,
                  ),
                ],
              );
            }

            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppSpacing.lg),
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
            );
          },
        );
      },
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
