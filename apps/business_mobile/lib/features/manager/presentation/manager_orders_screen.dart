import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/filter_chips.dart';
import '../../../shared/widgets/order_card.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../manager/data/couriers_repository.dart';
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
    final orders = ref.watch(ordersPollingProvider);
    final filter = ref.watch(orderFilterProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(ordersPollingProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
          children: [
            const ScreenHeader(
              title: AppStrings.managerPanel,
              subtitle: AppStrings.orders,
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
                            compact: true,
                            showRestaurant: true,
                            showAssignCourier: order.canReassignCourier,
                            isLoading: _actingOrderId == order.id,
                            onStatusChange: (next) => _updateStatus(order.id, next),
                            onAssignCourier: order.canReassignCourier
                                ? () => _showReassignDialog(order)
                                : null,
                            onRemoveCourier: order.canReassignCourier
                                ? () => _removeCourier(order.id)
                                : null,
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

  Future<void> _cancelOrder(String orderId) async {
    setState(() => _actingOrderId = orderId);
    try {
      await ref.read(ordersRepositoryProvider).updateStatus(
            orderId,
            'CANCELLED',
            cancelReason: 'Menejer tomonidan bekor qilindi',
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

  Future<void> _removeCourier(String orderId) async {
    setState(() => _actingOrderId = orderId);
    try {
      await ref.read(ordersRepositoryProvider).removeCourier(orderId);
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

  Future<void> _showReassignDialog(StaffOrderModel order) async {
    try {
      final couriers = await ref.read(couriersRepositoryProvider).fetchCouriers();
      if (!mounted) return;

      final active = couriers.where((c) => c.isActive).toList();
      if (active.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppStrings.noOnlineCouriers)),
        );
        return;
      }

      final selected = await showModalBottomSheet<String>(
        context: context,
        showDragHandle: true,
        builder: (context) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Text(AppStrings.selectCourier, style: AppTypography.subtitle),
                ),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: active.length,
                    itemBuilder: (context, index) {
                      final courier = active[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primarySoft,
                          child: Text(courier.fullName.characters.first),
                        ),
                        title: Text(courier.fullName),
                        subtitle: Text(courier.phone ?? ''),
                        trailing: Icon(
                          Icons.circle,
                          color: courier.isOnline ? AppColors.success : AppColors.textMuted,
                          size: 10,
                        ),
                        onTap: () => Navigator.pop(context, courier.id),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      );

      if (selected == null) return;
      setState(() => _actingOrderId = order.id);
      await ref.read(ordersRepositoryProvider).reassignCourier(order.id, selected);
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
