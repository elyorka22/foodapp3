import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/food_app_card.dart';
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
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(orderHistoryProvider),
        child: history.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [Center(child: Text(e.toString()))],
          ),
          data: (orders) {
            if (orders.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 120),
                  Center(child: Text(AppStrings.noHistory)),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final order = orders[index];
                return FoodAppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      '#${order.orderNumber}',
                      style: AppTypography.subtitle,
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (order.restaurantName != null)
                          Text(order.restaurantName!, style: AppTypography.bodySmall),
                        Text(
                          order.customerAddress ?? order.customerPhone ?? '—',
                          style: AppTypography.bodySmall,
                        ),
                      ],
                    ),
                    trailing: Text(
                      formatSum(order.courierFee ?? order.deliveryFee),
                      style: AppTypography.subtitle.copyWith(
                        color: const Color(0xFFFF6B00),
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
