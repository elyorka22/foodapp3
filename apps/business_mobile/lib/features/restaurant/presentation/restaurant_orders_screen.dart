import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/filter_chips.dart';
import '../../../shared/widgets/order_card.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../orders/data/orders_repository.dart';
import '../../orders/providers/orders_provider.dart';
import '../data/restaurant_repository.dart';

class RestaurantOrdersScreen extends ConsumerStatefulWidget {
  const RestaurantOrdersScreen({super.key});

  @override
  ConsumerState<RestaurantOrdersScreen> createState() => _RestaurantOrdersScreenState();
}

class _RestaurantOrdersScreenState extends ConsumerState<RestaurantOrdersScreen> {
  String? _actingOrderId;

  @override
  Widget build(BuildContext context) {
    final restaurant = ref.watch(_restaurantProvider);
    final stats = ref.watch(_statsProvider);
    final orders = ref.watch(ordersPollingProvider);
    final filter = ref.watch(orderFilterProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(ordersPollingProvider);
          ref.invalidate(_restaurantProvider);
          ref.invalidate(_statsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
          children: [
            ScreenHeader(
              title: restaurant.valueOrNull?.name ?? AppStrings.restaurantPanel,
              subtitle: AppStrings.orders,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: stats.when(
                data: (s) => Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        label: AppStrings.ordersCount,
                        value: '${s?.ordersToday ?? 0}',
                        icon: Icons.receipt_long_outlined,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: StatCard(
                        label: AppStrings.revenueToday,
                        value: s != null ? formatSum(s.revenueToday) : '—',
                        icon: Icons.payments_outlined,
                        accentColor: AppColors.accent,
                      ),
                    ),
                  ],
                ),
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: FilterChipsRow(
                options: const [
                  FilterChipOption(label: AppStrings.filterAll, value: null),
                  FilterChipOption(label: AppStrings.filterActive, value: 'active'),
                  FilterChipOption(label: AppStrings.filterCancelled, value: 'cancelled'),
                ],
                selected: filter,
                onSelected: (v) => ref.read(orderFilterProvider.notifier).state = v,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            orders.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => ErrorState(
                message: ApiException.formatError(e),
                onRetry: () => ref.invalidate(ordersPollingProvider),
              ),
              data: (list) {
                if (list.isEmpty) {
                  return const EmptyState(
                    icon: Icons.inbox_outlined,
                    title: AppStrings.noOrders,
                  );
                }
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Column(
                    children: list
                        .map(
                          (order) => OrderCard(
                            order: order,
                            showAssignCourier: false,
                            isLoading: _actingOrderId == order.id,
                            onStatusChange: (next) => _updateStatus(order.id, next),
                            onRequestCourier: () => _requestCourier(order.id),
                            onCancel: order.canCancel
                                ? () => _cancelOrder(order.id)
                                : null,
                          ),
                        )
                        .toList(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _updateStatus(String orderId, String status) async {
    setState(() => _actingOrderId = orderId);
    try {
      await ref.read(ordersRepositoryProvider).updateStatus(orderId, status);
      ref.invalidate(ordersPollingProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _actingOrderId = null);
    }
  }

  Future<void> _requestCourier(String orderId) async {
    setState(() => _actingOrderId = orderId);
    try {
      await ref.read(ordersRepositoryProvider).requestCourier(orderId);
      ref.invalidate(ordersPollingProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _actingOrderId = null);
    }
  }

  Future<void> _cancelOrder(String orderId) async {
    setState(() => _actingOrderId = orderId);
    try {
      await ref.read(ordersRepositoryProvider).updateStatus(
            orderId,
            'CANCELLED',
            cancelReason: 'Restoran tomonidan bekor qilindi',
          );
      ref.invalidate(ordersPollingProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _actingOrderId = null);
    }
  }
}

final _restaurantProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchMyRestaurant();
});

final _statsProvider = FutureProvider.autoDispose((ref) async {
  final restaurant = await ref.watch(_restaurantProvider.future);
  if (restaurant == null) return null;
  return ref.watch(restaurantRepositoryProvider).fetchStats(restaurant.id);
});
