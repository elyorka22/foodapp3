import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/new_order_incoming_card.dart';
import '../../../shared/widgets/open_order_in_progress_card.dart';
import '../../orders/data/orders_repository.dart';
import '../../orders/providers/orders_provider.dart';
import '../data/restaurant_repository.dart';

enum _OrdersTab { neu, cooking, ready }

class RestaurantOrdersScreen extends ConsumerStatefulWidget {
  const RestaurantOrdersScreen({super.key});

  @override
  ConsumerState<RestaurantOrdersScreen> createState() =>
      _RestaurantOrdersScreenState();
}

class _RestaurantOrdersScreenState
    extends ConsumerState<RestaurantOrdersScreen> {
  String? _actingOrderId;
  _OrdersTab _tab = _OrdersTab.neu;

  @override
  Widget build(BuildContext context) {
    final restaurant = ref.watch(_restaurantProvider);
    final orders = ref.watch(openOrdersPollingProvider);
    final name = restaurant.valueOrNull?.name ?? AppStrings.restaurantPanel;

    return Scaffold(
      backgroundColor: AppColors.backgroundRestaurant,
      body: RefreshIndicator(
        color: AppColors.restaurant,
        onRefresh: () async {
          ref.invalidate(restaurantAllOrdersPollingProvider);
          ref.invalidate(_restaurantProvider);
        },
        child: ListView(
          padding: scrollSafePadding(
            context,
            base: const EdgeInsets.fromLTRB(20, 20, 20, AppSpacing.xxl),
          ),
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                          color: AppColors.textRestaurant,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Buyurtmalarni qabul qiling',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondaryRestaurant,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => context.push(AppRoutes.notifications),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.surface,
                    side: const BorderSide(color: AppColors.borderRestaurant),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  icon: const Icon(Icons.notifications_none_rounded),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () => context.push(AppRoutes.restaurantHistory),
                  child: const Text(AppStrings.orderHistory),
                ),
              ],
            ),
            const SizedBox(height: 14),
            orders.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Text(
                  ApiException.formatError(e),
                  textAlign: TextAlign.center,
                ),
              ),
              data: (list) {
                final neu = list.where((o) => o.isPending).toList();
                final cooking = list
                    .where(
                      (o) =>
                          !o.isPending &&
                          o.courierRequestedAt == null &&
                          (o.status == 'ACCEPTED' || o.status == 'PREPARING'),
                    )
                    .toList();
                final ready = list
                    .where((o) => o.courierRequestedAt != null)
                    .toList();

                final visible = switch (_tab) {
                  _OrdersTab.neu => neu,
                  _OrdersTab.cooking => cooking,
                  _OrdersTab.ready => ready,
                };

                return Column(
                  children: [
                    _SegmentedTabs(
                      tabs: [
                        ('Yangi', neu.length),
                        ('Tayyorlanmoqda', cooking.length),
                        ('Tayyor', ready.length),
                      ],
                      selected: _tab.index,
                      onSelect: (i) =>
                          setState(() => _tab = _OrdersTab.values[i]),
                    ),
                    const SizedBox(height: 14),
                    if (visible.isEmpty)
                      EmptyState(
                        icon: Icons.notifications_active_outlined,
                        title: switch (_tab) {
                          _OrdersTab.neu => AppStrings.noNewOrders,
                          _OrdersTab.cooking =>
                            'Hozir tayyorlanayotgan buyurtma yo‘q.',
                          _OrdersTab.ready =>
                            'Kuryer kutayotgan buyurtma yo‘q.',
                        },
                      )
                    else
                      ...visible.map(
                        (order) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: order.isPending
                              ? NewOrderIncomingCard(
                                  order: order,
                                  isLoading: _actingOrderId == order.id,
                                  useRestaurantAccent: true,
                                  onAccept: () => _acceptAndOpen(order.id),
                                  onDetails: () => context.push(
                                    AppRoutes.restaurantOrderDetail(order.id),
                                  ),
                                )
                              : OpenOrderInProgressCard(
                                  order: order,
                                  useRestaurantAccent: true,
                                  onTap: () => context.push(
                                    AppRoutes.restaurantOrderDetail(order.id),
                                  ),
                                  onReady: order.courierRequestedAt == null &&
                                          order.status == 'PREPARING'
                                      ? () => _markReady(order)
                                      : null,
                                ),
                        ),
                      ),
                  ],
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

  Future<void> _markReady(StaffOrderModel order) async {
    try {
      await ref.read(ordersRepositoryProvider).requestCourier(order.id);
      ref.invalidate(restaurantAllOrdersPollingProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    }
  }
}

class _SegmentedTabs extends StatelessWidget {
  const _SegmentedTabs({
    required this.tabs,
    required this.selected,
    required this.onSelect,
  });

  final List<(String, int)> tabs;
  final int selected;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderRestaurant),
      ),
      child: Row(
        children: [
          for (var i = 0; i < tabs.length; i++)
            Expanded(
              child: GestureDetector(
                onTap: () => onSelect(i),
                child: Container(
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected == i
                        ? AppColors.textRestaurant
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: Text(
                          tabs[i].$1,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: selected == i
                                ? Colors.white
                                : AppColors.textSecondaryRestaurant,
                          ),
                        ),
                      ),
                      const SizedBox(width: 5),
                      Container(
                        constraints: const BoxConstraints(minWidth: 20),
                        height: 20,
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: selected == i
                              ? Colors.white
                              : AppColors.borderRestaurant,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${tabs[i].$2}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textRestaurant,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

final _restaurantProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchMyRestaurant();
});
