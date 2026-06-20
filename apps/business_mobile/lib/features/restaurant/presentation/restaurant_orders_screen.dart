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
import '../../../shared/widgets/open_order_in_progress_card.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../../core/utils/safe_area_padding.dart';
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
    final orders = ref.watch(openOrdersPollingProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(restaurantAllOrdersPollingProvider);
          ref.invalidate(_restaurantProvider);
        },
        child: ListView(
          padding: scrollSafePadding(
            context,
            base: const EdgeInsets.only(bottom: AppSpacing.xxl),
          ),
          children: [
            ScreenHeader(
              title: restaurant.valueOrNull?.name ?? AppStrings.restaurantPanel,
              trailing: TextButton.icon(
                onPressed: () => context.push(AppRoutes.restaurantHistory),
                icon: const Icon(Icons.history, size: 20),
                label: const Text(AppStrings.orderHistory),
              ),
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
                            child: order.isPending
                                ? NewOrderIncomingCard(
                                    order: order,
                                    isLoading: _actingOrderId == order.id,
                                    onAccept: () => _acceptAndOpen(order.id),
                                  )
                                : OpenOrderInProgressCard(
                                    order: order,
                                    onTap: () => context.push(
                                      AppRoutes.restaurantOrderDetail(order.id),
                                    ),
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
      ref.invalidate(restaurantAllOrdersPollingProvider);
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
