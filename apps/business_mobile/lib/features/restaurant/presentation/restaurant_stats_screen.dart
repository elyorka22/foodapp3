import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../../shared/widgets/stat_card.dart';
import '../data/restaurant_repository.dart';

class RestaurantStatsScreen extends ConsumerWidget {
  const RestaurantStatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurant = ref.watch(_restaurantProvider);
    final stats = ref.watch(_statsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(_restaurantProvider);
          ref.invalidate(_statsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
          children: [
            ScreenHeader(
              title: AppStrings.statistics,
              subtitle: restaurant.valueOrNull?.name,
            ),
            stats.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => ErrorState(
                message: ApiException.formatError(e),
                onRetry: () => ref.invalidate(_statsProvider),
              ),
              data: (s) {
                if (s == null) {
                  return const EmptyState(
                    icon: Icons.bar_chart_outlined,
                    title: AppStrings.statistics,
                  );
                }
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: StatCard(
                              label: AppStrings.revenueToday,
                              value: formatSum(s.revenueToday),
                              icon: Icons.payments_outlined,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: StatCard(
                              label: AppStrings.ordersCount,
                              value: '${s.ordersToday}',
                              icon: Icons.receipt_long_outlined,
                              accentColor: AppColors.accent,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Expanded(
                            child: StatCard(
                              label: AppStrings.revenueWeek,
                              value: formatSum(s.revenueWeek),
                              icon: Icons.calendar_view_week_outlined,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: StatCard(
                              label: AppStrings.revenueMonth,
                              value: formatSum(s.revenueMonth),
                              icon: Icons.calendar_month_outlined,
                              accentColor: AppColors.info,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      AppCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(AppStrings.averageOrder, style: AppTypography.bodySmall),
                            const SizedBox(height: 6),
                            Text(
                              formatSum(s.averageOrderValue),
                              style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                      ),
                      if (s.topProducts.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.lg),
                        Text(AppStrings.topProducts, style: AppTypography.subtitle),
                        const SizedBox(height: AppSpacing.sm),
                        ...s.topProducts.map(
                          (p) => AppCard(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                Expanded(child: Text(p.name, style: AppTypography.body)),
                                Text(
                                  '${p.quantity} ta',
                                  style: AppTypography.caption,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  formatSum(p.revenue),
                                  style: AppTypography.body.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

final _restaurantProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchMyRestaurant();
});

final _statsProvider = FutureProvider.autoDispose((ref) async {
  final restaurant = await ref.watch(_restaurantProvider.future);
  if (restaurant == null) return null;
  return ref.watch(restaurantRepositoryProvider).fetchStats(restaurant.id);
});
