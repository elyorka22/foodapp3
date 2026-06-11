import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/jobs/courier_job_adapter.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../../../shared/widgets/service_type_badge.dart';
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
        color: AppColors.primary,
        child: history.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [Center(child: Text('$e'))],
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
              itemBuilder: (context, index) => _HistoryCard(order: orders[index]),
            );
          },
        ),
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  const _HistoryCard({required this.order});

  final CourierOrderModel order;

  @override
  Widget build(BuildContext context) {
    final dateLabel = order.createdAt != null
        ? DateFormat('dd.MM.yyyy HH:mm').format(order.createdAt!.toLocal())
        : null;
    final pickup = order.stops.isNotEmpty ? order.stops.first.title : order.restaurantName;

    return FoodAppCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ServiceTypeBadge(type: order.serviceType, compact: true),
              const Spacer(),
              Text(
                formatSum(order.courierFee ?? order.deliveryFee),
                style: AppTypography.subtitle.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text('#${order.orderNumber}', style: AppTypography.subtitle),
          if (pickup != null) ...[
            const SizedBox(height: 4),
            Text(pickup, style: AppTypography.body),
          ],
          if (order.customerAddress != null) ...[
            const SizedBox(height: 2),
            Text(
              order.customerAddress!,
              style: AppTypography.bodySmall,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (dateLabel != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.check_circle, size: 14, color: AppColors.success),
                const SizedBox(width: 4),
                Text(dateLabel, style: AppTypography.caption),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
