import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format_sum.dart';
import '../data/courier_repository.dart';

final orderHistoryProvider = FutureProvider.autoDispose((ref) async {
  return ref.read(courierRepositoryProvider).fetchHistory();
});

class OrderHistoryScreen extends ConsumerWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(orderHistoryProvider);

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.orderHistory)),
      body: history.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (orders) {
          if (orders.isEmpty) {
            return const Center(child: Text(AppStrings.noHistory));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: orders.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final order = orders[index];
              return Card(
                child: ListTile(
                  title: Text(order.restaurantName ?? order.orderNumber),
                  subtitle: Text(order.customerPhone ?? order.customerAddress ?? '—'),
                  trailing: Text(formatSum(order.courierFee ?? order.deliveryFee)),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
