import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/new_order_incoming_card.dart';
import '../../../shared/widgets/open_order_in_progress_card.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../orders/data/orders_repository.dart';
import '../../orders/providers/orders_provider.dart';

class ManagerOrdersScreen extends ConsumerStatefulWidget {
  const ManagerOrdersScreen({super.key});

  @override
  ConsumerState<ManagerOrdersScreen> createState() => _ManagerOrdersScreenState();
}

class _ManagerOrdersScreenState extends ConsumerState<ManagerOrdersScreen> {
  String? _actingOrderId;

  @override
  Widget build(BuildContext context) {
    final orders = ref.watch(managerOpenOrdersPollingProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(managerOpenOrdersPollingProvider);
        },
        child: ListView(
          padding: scrollSafePadding(
            context,
            base: const EdgeInsets.only(bottom: AppSpacing.xxl),
          ),
          children: [
            ScreenHeader(
              title: AppStrings.managerPanel,
              subtitle: AppStrings.orders,
              trailing: TextButton.icon(
                onPressed: () => context.push(AppRoutes.managerHistory),
                icon: const Icon(Icons.history, size: 20),
                label: const Text(AppStrings.orderHistory),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.infoSoft,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  AppStrings.dispatchAuto,
                  style: AppTypography.caption.copyWith(color: AppColors.info),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
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
                                    restaurantName: order.restaurantName,
                                    isLoading: _actingOrderId == order.id,
                                    onAccept: () => _acceptOrder(order.id),
                                    onDetails: () => context.push(
                                      AppRoutes.managerOrderDetail(order.id),
                                    ),
                                  )
                                : OpenOrderInProgressCard(
                                    order: order,
                                    restaurantName: order.restaurantName,
                                    onTap: () => context.push(
                                      AppRoutes.managerOrderDetail(order.id),
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

  Future<void> _acceptOrder(String orderId) async {
    setState(() => _actingOrderId = orderId);
    try {
      await ref.read(ordersRepositoryProvider).updateStatus(orderId, 'ACCEPTED');
      ref.invalidate(managerOpenOrdersPollingProvider);
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
