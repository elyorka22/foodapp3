import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/order_model.dart';
import '../data/couriers_repository.dart';

final couriersListProvider = FutureProvider.autoDispose<List<CourierListItemModel>>((ref) async {
  return ref.watch(couriersRepositoryProvider).fetchCouriers();
});

class ManagerCouriersScreen extends ConsumerWidget {
  const ManagerCouriersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final couriers = ref.watch(couriersListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.couriers)),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(couriersListProvider),
        child: couriers.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(ApiException.formatError(e))),
          data: (list) {
            if (list.isEmpty) {
              return const Center(child: Text('Kuryerlar yo\'q'));
            }
            return ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final courier = list[index];
                return Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.circle,
                        size: 10,
                        color: courier.isOnline ? AppColors.success : AppColors.textMuted,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(courier.fullName, style: AppTypography.subtitle),
                            if (courier.phone != null)
                              Text(courier.phone!, style: AppTypography.bodySmall),
                          ],
                        ),
                      ),
                      Text(
                        courier.isOnline ? AppStrings.online : AppStrings.offline,
                        style: AppTypography.caption,
                      ),
                    ],
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
