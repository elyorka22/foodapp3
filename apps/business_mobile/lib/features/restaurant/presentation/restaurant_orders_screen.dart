import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/new_order_incoming_card.dart';
import '../../../shared/widgets/screen_header.dart';
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
    final orders = ref.watch(newOrdersPollingProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(newOrdersPollingProvider);
          ref.invalidate(_restaurantProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
          children: [
            ScreenHeader(
              title: restaurant.valueOrNull?.name ?? AppStrings.restaurantPanel,
              subtitle: AppStrings.newOrders,
            ),
            orders.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Text(ApiException.formatError(e), textAlign: TextAlign.center),
              ),
              data: (list) {
                if (list.isEmpty) {
                  return const EmptyState(
                    icon: Icons.notifications_active_outlined,
                    title: AppStrings.noNewOrders,
                  );
                }
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Column(
                    children: list
                        .map(
                          (order) => Padding(
                            padding: const EdgeInsets.only(bottom: AppSpacing.md),
                            child: NewOrderIncomingCard(
                              order: order,
                              isLoading: _actingOrderId == order.id,
                              onAccept: () => _acceptAndOpen(order.id),
                            ),
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

  Future<void> _acceptAndOpen(String orderId) async {
    setState(() => _actingOrderId = orderId);
    try {
      final repo = ref.read(ordersRepositoryProvider);
      await repo.updateStatus(orderId, 'ACCEPTED');
      await repo.updateStatus(orderId, 'PREPARING');
      ref.invalidate(newOrdersPollingProvider);
      ref.invalidate(historyOrdersPollingProvider);
      if (mounted) {
        context.push(AppRoutes.restaurantOrderDetail(orderId));
      }
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
