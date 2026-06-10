import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_weekly_stats_model.dart';
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
      appBar: AppBar(title: const Text(AppStrings.tabStatistics)),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(weeklyStatsProvider),
        child: stats.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [Center(child: Text('$e'))],
          ),
          data: (data) {
            if (data.days.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 120),
                  Center(child: Text(AppStrings.noStatistics)),
                ],
              );
            }

            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _SummaryCard(
                        label: AppStrings.weekDeliveries,
                        value: '${data.weekDeliveries}',
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: _SummaryCard(
                        label: AppStrings.weekEarnings,
                        value: formatSum(data.weekEarnings),
                        accent: true,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(AppStrings.weekDailyBreakdown, style: AppTypography.subtitle),
                const SizedBox(height: AppSpacing.md),
                ...data.days.map((day) => _DayRow(day: day)),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.label,
    required this.value,
    this.accent = false,
  });

  final String label;
  final String value;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: accent ? AppColors.primarySoft : const Color(0xFFF7F8FA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTypography.subtitle.copyWith(
              color: accent ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
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
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTypography.body)),
          Text('${day.deliveries}', style: AppTypography.bodySmall),
          const SizedBox(width: AppSpacing.md),
          Text(
            formatSum(day.earnings),
            style: AppTypography.body.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
