import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/order_card.dart';
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

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.managerPanel)),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(ordersPollingProvider),
        child: orders.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(ApiException.formatError(e))),
          data: (list) {
            if (list.isEmpty) {
              return const Center(child: Text(AppStrings.noOrders));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final order = list[index];
                return OrderCard(
                  order: order,
                  showRestaurant: true,
                  isLoading: _actingOrderId == order.id,
                  onStatusChange: (next) => _updateStatus(order.id, next),
                  onAssignCourier: order.canAssignCourier
                      ? () => _showAssignDialog(order)
                      : null,
                );
              },
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

  Future<void> _showAssignDialog(StaffOrderModel order) async {
    try {
      final couriers = await ref.read(couriersRepositoryProvider).fetchCouriers();
      if (!mounted) return;

      final online = couriers.where((c) => c.isOnline && c.isActive).toList();
      if (online.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Onlayn kuryerlar yo\'q')),
        );
        return;
      }

      final selected = await showModalBottomSheet<String>(
        context: context,
        builder: (context) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Text(
                    AppStrings.selectCourier,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                ...online.map(
                  (courier) => ListTile(
                    title: Text(courier.fullName),
                    subtitle: Text(courier.phone ?? ''),
                    trailing: const Icon(Icons.circle, color: Colors.green, size: 10),
                    onTap: () => Navigator.pop(context, courier.id),
                  ),
                ),
              ],
            ),
          );
        },
      );

      if (selected == null) return;
      setState(() => _actingOrderId = order.id);
      await ref.read(ordersRepositoryProvider).assignCourier(order.id, selected);
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
