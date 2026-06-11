import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_weekly_stats_model.dart';
import '../../../shared/widgets/food_app_card.dart';
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
        color: AppColors.primary,
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
                        icon: Icons.check_circle_outline,
                        label: AppStrings.weekDeliveries,
                        value: '${data.weekDeliveries}',
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: _SummaryCard(
                        icon: Icons.payments_outlined,
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
    required this.icon,
    required this.label,
    required this.value,
    this.accent = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool accent;

  @override
  Widget build(BuildContext context) {
    return FoodAppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: accent ? AppColors.primary : AppColors.textMuted, size: 20),
          const SizedBox(height: 8),
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.title.copyWith(
              color: accent ? AppColors.primary : AppColors.textPrimary,
              fontSize: 22,
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
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(12),
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
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
