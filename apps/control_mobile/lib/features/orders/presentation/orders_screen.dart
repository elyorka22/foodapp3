import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../core/network/paginated_response.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/order_model.dart';
import '../data/orders_repository.dart';

final ordersListProvider =
    FutureProvider.autoDispose<PaginatedResponse<ControlOrder>>((ref) {
  return ref.watch(ordersRepositoryProvider).fetchOrders(page: 1, limit: 40);
});

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(ordersListProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            0,
          ),
          child: Text(AppStrings.ordersTitle, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<PaginatedResponse<ControlOrder>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(ordersListProvider.future),
            isEmpty: (p) => p.data.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.all(AppSpacing.lg),
            dataBuilder: (page) {
              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: page.data.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final o = page.data[index];
                  return ControlListCard(
                    title: o.orderNumber.isNotEmpty ? o.orderNumber : o.id,
                    subtitle: [
                      if (o.businessName != null) o.businessName!,
                      formatMoney(o.total),
                      if (o.customerPhone != null) o.customerPhone!,
                      if (o.createdAt != null) formatDateTime(o.createdAt),
                    ].join(' · '),
                    trailing: StatusChip(status: o.status),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
