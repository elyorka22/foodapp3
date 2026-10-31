import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(orderHistoryProvider),
          color: AppColors.primary,
          child: history.when(
            loading: () => ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                SizedBox(height: 180),
                Center(child: CircularProgressIndicator()),
              ],
            ),
            error: (e, _) => ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              children: [
                const SizedBox(height: 80),
                Text('$e', style: AppTypography.bodySmall, textAlign: TextAlign.center),
              ],
            ),
            data: (orders) {
              if (orders.isEmpty) {
                return ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                      child: Text(
                        AppStrings.orderHistory,
                        style: AppTypography.title.copyWith(fontSize: 26),
                      ),
                    ),
                    const SizedBox(height: 100),
                    Center(
                      child: Text(AppStrings.noHistory, style: AppTypography.bodySmall),
                    ),
                  ],
                );
              }

              return ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
                itemCount: orders.length + 1,
                separatorBuilder: (_, index) =>
                    index == 0 ? const SizedBox(height: 12) : const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return Text(
                      AppStrings.orderHistory,
                      style: AppTypography.title.copyWith(fontSize: 26),
                    );
                  }
                  return _HistoryCard(order: orders[index - 1]);
                },
              );
            },
          ),
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
        ? DateFormat('dd.MM.yyyy · HH:mm').format(order.createdAt!.toLocal())
        : null;
    final isStore = order.businessTypeSlug != null &&
        order.businessTypeSlug != 'restaurant' &&
        order.businessTypeSlug!.isNotEmpty;
    final title = isStore ? AppStrings.storeOrder : AppStrings.restaurantOrder;
    final subtitle = order.restaurantName ?? order.customerAddress ?? '#${order.orderNumber}';
    final distance = order.distanceKm != null
        ? '${order.distanceKm!.toStringAsFixed(1)} km'
        : null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.surfaceHighlight,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              isStore ? Icons.store_mall_directory_outlined : Icons.restaurant_outlined,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.subtitle.copyWith(fontSize: 15)),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: AppTypography.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (dateLabel != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    distance == null ? dateLabel : '$dateLabel · $distance',
                    style: AppTypography.caption,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '+${formatSumNumber(order.courierEarnings)}',
            style: AppTypography.subtitle.copyWith(
              color: AppColors.accent,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
