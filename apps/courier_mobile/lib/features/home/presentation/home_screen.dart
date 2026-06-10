import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../../../shared/widgets/info_row.dart';
import '../../home/providers/courier_home_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(courierOnlineProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final onlineState = ref.watch(courierOnlineProvider);
    final activeOrder = ref.watch(activeOrderProvider);
    final available = ref.watch(availableOrdersProvider);
    final earnings = ref.watch(courierEarningsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final isOnline = onlineState.valueOrNull ?? false;

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
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(activeOrderProvider);
          ref.invalidate(availableOrdersProvider);
          ref.invalidate(courierProfileProvider);
          ref.invalidate(courierEarningsProvider);
          ref.invalidate(notificationsUnreadProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            earnings.when(
              loading: () => const SizedBox(
                height: 88,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (_, __) => const SizedBox.shrink(),
              data: (data) => _StatsRow(
                earnings: formatSum(data.totalEarnings),
                deliveries: '${data.completedAssignments}',
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            FoodAppCard(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isOnline ? AppStrings.online : AppStrings.offline,
                          style: AppTypography.subtitle,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          isOnline
                              ? 'Yangi buyurtmalar qabul qilinadi'
                              : 'Buyurtmalar to\'xtatilgan',
                          style: AppTypography.bodySmall,
                        ),
                      ],
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
            const SizedBox(height: AppSpacing.lg),
            activeOrder.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text(e.toString()),
              data: (order) {
                if (order == null) return const SizedBox.shrink();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(AppStrings.activeDelivery, style: AppTypography.subtitle),
                    const SizedBox(height: AppSpacing.md),
                    _OrderSummaryCard(
                      order: order,
                      onOpen: () => context.push(AppRoutes.activeOrder, extra: order.id),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                  ],
                );
              },
            ),
            if (isOnline)
              available.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Text(e.toString()),
                data: (orders) {
                  if (orders.isEmpty) {
                    return _EmptyState();
                  }
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(AppStrings.availableOrders, style: AppTypography.subtitle),
                      const SizedBox(height: AppSpacing.md),
                      ...orders.map(
                        (order) => Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.md),
                          child: _OrderSummaryCard(
                            order: order,
                            onOpen: () =>
                                context.push(AppRoutes.incomingOrder, extra: order.id),
                            showAcceptHint: true,
                          ),
                        ),
                      ),
                    ],
                  );
                },
              )
            else
              _EmptyState(),
          ],
        ),
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.earnings, required this.deliveries});

  final String earnings;
  final String deliveries;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: FoodAppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppStrings.todayEarnings, style: AppTypography.caption),
                const SizedBox(height: 4),
                Text(earnings, style: AppTypography.subtitle),
              ],
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: FoodAppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppStrings.deliveries, style: AppTypography.caption),
                const SizedBox(height: 4),
                Text(deliveries, style: AppTypography.subtitle),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _OrderSummaryCard extends StatelessWidget {
  const _OrderSummaryCard({
    required this.order,
    required this.onOpen,
    this.showAcceptHint = false,
  });

  final CourierOrderModel order;
  final VoidCallback onOpen;
  final bool showAcceptHint;

  @override
  Widget build(BuildContext context) {
    return FoodAppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InfoRow(label: AppStrings.orderId, value: order.orderNumber),
          InfoRow(label: AppStrings.restaurant, value: order.restaurantName ?? '—'),
          InfoRow(label: AppStrings.address, value: order.customerAddress ?? '—'),
          if (order.distanceKm != null)
            InfoRow(label: AppStrings.distance, value: '${order.distanceKm} km'),
          InfoRow(
            label: AppStrings.deliveryFee,
            value: formatSum(order.courierFee ?? order.deliveryFee),
          ),
          const SizedBox(height: AppSpacing.md),
          FoodAppButton(
            label: showAcceptHint ? AppStrings.accept : AppStrings.openOrder,
            onPressed: onOpen,
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FoodAppCard(
      child: Column(
        children: [
          const Icon(Icons.hourglass_empty, size: 56, color: AppColors.textMuted),
          const SizedBox(height: AppSpacing.md),
          Text(
            AppStrings.waitingOrders,
            style: AppTypography.subtitle,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            AppStrings.waitingOrdersHint,
            style: AppTypography.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
