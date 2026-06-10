import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/order_card.dart';
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
    final formatter = NumberFormat.decimalPattern('uz');

    return Scaffold(
      appBar: AppBar(
        title: restaurant.when(
          data: (r) => Text(r?.name ?? AppStrings.restaurantPanel),
          loading: () => const Text(AppStrings.restaurantPanel),
          error: (_, __) => const Text(AppStrings.restaurantPanel),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(ordersPollingProvider);
          ref.invalidate(_restaurantProvider);
          ref.invalidate(_statsProvider);
        },
        child: orders.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => _ErrorState(
            message: ApiException.formatError(e),
            onRetry: () => ref.invalidate(ordersPollingProvider),
          ),
          data: (list) {
            return ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                stats.when(
                  data: (s) => Row(
                    children: [
                      Expanded(
                        child: _StatTile(
                          label: AppStrings.ordersCount,
                          value: '${s?.totalOrders ?? '—'}',
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: _StatTile(
                          label: AppStrings.revenue,
                          value: s != null ? '${formatter.format(s.revenue)} UZS' : '—',
                        ),
                      ),
                    ],
                  ),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: AppSpacing.lg),
                if (list.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 48),
                    child: Center(child: Text(AppStrings.noOrders)),
                  )
                else
                  ...list.map(
                    (order) => OrderCard(
                      order: order,
                      isLoading: _actingOrderId == order.id,
                      onStatusChange: (next) => _updateStatus(order.id, next),
                      onRequestCourier: () => _requestCourier(order.id),
                    ),
                  ),
              ],
            );
          },
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
}

final _restaurantProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchMyRestaurant();
});

final _statsProvider = FutureProvider.autoDispose((ref) async {
  final restaurant = await ref.watch(_restaurantProvider.future);
  if (restaurant == null) return null;
  return ref.watch(restaurantRepositoryProvider).fetchStats(restaurant.id);
});

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 4),
          Text(value, style: AppTypography.subtitle),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: onRetry, child: const Text(AppStrings.retry)),
          ],
        ),
      ),
    );
  }
}
