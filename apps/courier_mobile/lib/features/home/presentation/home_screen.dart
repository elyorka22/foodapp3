import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
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
  String? _shownIncomingId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(courierOnlineProvider.notifier).load());
  }

  void _maybeShowIncoming(String? orderId) {
    if (orderId == null || _shownIncomingId == orderId) return;
    _shownIncomingId = orderId;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.push(AppRoutes.incomingOrder, extra: orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final onlineState = ref.watch(courierOnlineProvider);
    final activeOrder = ref.watch(activeOrderProvider);
    final available = ref.watch(availableOrdersProvider);
    final isOnline = onlineState.valueOrNull ?? false;

    if (isOnline && activeOrder.valueOrNull == null) {
      available.whenData((orders) {
        if (orders.isNotEmpty) _maybeShowIncoming(orders.first.id);
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.appName),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push(AppRoutes.notifications),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push(AppRoutes.profile),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(activeOrderProvider);
          ref.invalidate(availableOrdersProvider);
          ref.invalidate(courierProfileProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
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
                if (order == null) return _EmptyState();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(AppStrings.activeDelivery, style: AppTypography.subtitle),
                    const SizedBox(height: AppSpacing.md),
                    FoodAppCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          InfoRow(label: AppStrings.orderId, value: order.orderNumber),
                          InfoRow(
                            label: AppStrings.restaurant,
                            value: order.restaurantName ?? '—',
                          ),
                          InfoRow(
                            label: AppStrings.customer,
                            value: order.customerPhone ?? order.customerName ?? '—',
                          ),
                          if (order.distanceKm != null)
                            InfoRow(
                              label: AppStrings.distance,
                              value: '${order.distanceKm} km',
                            ),
                          InfoRow(
                            label: AppStrings.deliveryFee,
                            value: formatSum(order.courierFee ?? order.deliveryFee),
                          ),
                          InfoRow(
                            label: AppStrings.address,
                            value: order.customerAddress ?? '—',
                          ),
                          const SizedBox(height: AppSpacing.md),
                          FoodAppButton(
                            label: AppStrings.openOrder,
                            onPressed: () =>
                                context.push(AppRoutes.activeOrder, extra: order.id),
                          ),
                        ],
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
