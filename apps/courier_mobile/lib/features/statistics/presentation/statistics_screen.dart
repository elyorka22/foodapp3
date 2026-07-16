import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_weekly_stats_model.dart';
import '../../../shared/widgets/app_atmosphere.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/metric_block.dart';
import '../../orders/data/courier_repository.dart';

final weeklyStatsProvider = FutureProvider.autoDispose<CourierWeeklyStatsModel>((ref) async {
  return ref.read(courierRepositoryProvider).fetchWeeklyStats();
});

class StatisticsScreen extends ConsumerWidget {
  const StatisticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(weeklyStatsProvider);

    return Scaffold(
      body: AppAtmosphere(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(weeklyStatsProvider),
          color: AppColors.primary,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverAppBar(
                pinned: true,
                title: const Text(AppStrings.tabStatistics),
                backgroundColor: AppColors.background.withValues(alpha: 0.92),
              ),
              ...stats.when(
                loading: () => [
                  const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  ),
                ],
                error: (e, _) => [
                  SliverFillRemaining(
                    child: EmptyState(
                      icon: Icons.error_outline,
                      title: '$e',
                      actionLabel: AppStrings.retry,
                      onAction: () => ref.invalidate(weeklyStatsProvider),
                    ),
                  ),
                ],
                data: (data) {
                  if (data.days.isEmpty) {
                    return [
                      const ContainedSliver(
                        child: EmptyState(
                          icon: Icons.insights_outlined,
                          title: AppStrings.noStatistics,
                          subtitle: 'Haftalik ma\'lumotlar shu yerda ko\'rinadi',
                        ),
                      ),
                    ];
                  }

                  return [
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        AppSpacing.sm,
                        AppSpacing.lg,
                        AppSpacing.xxl,
                      ),
                      sliver: SliverList(
                        delegate: SliverChildListDelegate([
                          MetricRow(
                            children: [
                              MetricBlock(
                                label: AppStrings.weekDeliveries,
                                value: '${data.weekDeliveries}',
                                icon: Icons.check_circle_outline,
                              ),
                              MetricBlock(
                                label: AppStrings.weekEarnings,
                                value: formatSum(data.weekEarnings),
                                accent: true,
                                icon: Icons.payments_outlined,
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.xxl),
                          Text(AppStrings.weekDailyBreakdown, style: AppTypography.subtitle),
                          const SizedBox(height: AppSpacing.md),
                          ...data.days.map((day) => _DayRow(day: day)),
                        ]),
                      ),
                    ),
                  ];
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Helper so empty state sits nicely inside CustomScrollView.
class ContainedSliver extends StatelessWidget {
  const ContainedSliver({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SliverFillRemaining(hasScrollBody: false, child: child);
  }
}

class _DayRow extends StatelessWidget {
  const _DayRow({required this.day});

  final CourierWeeklyDayModel day;

  @override
  Widget build(BuildContext context) {
    final parsed = DateTime.tryParse(day.date);
    final label = parsed != null
        ? DateFormat('dd.MM (EEE)').format(parsed)
        : day.date;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.border.withValues(alpha: 0.7)),
        ),
      ),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTypography.body)),
          Text(
            '${day.deliveries}',
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(width: AppSpacing.lg),
          Text(
            formatSum(day.earnings),
            style: AppTypography.body.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
