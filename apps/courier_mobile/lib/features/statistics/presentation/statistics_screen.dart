import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/models/courier_weekly_stats_model.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../home/providers/courier_home_provider.dart';
import '../../orders/data/courier_repository.dart';
import '../../orders/presentation/order_history_screen.dart';

final weeklyStatsProvider = FutureProvider.autoDispose<CourierWeeklyStatsModel>((ref) async {
  return ref.read(courierRepositoryProvider).fetchWeeklyStats();
});

enum _EarningsPeriod { today, week, month }

class StatisticsScreen extends ConsumerStatefulWidget {
  const StatisticsScreen({super.key});

  @override
  ConsumerState<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends ConsumerState<StatisticsScreen> {
  _EarningsPeriod _period = _EarningsPeriod.week;

  @override
  Widget build(BuildContext context) {
    final weekly = ref.watch(weeklyStatsProvider);
    final shift = ref.watch(shiftStatsProvider);
    final history = ref.watch(orderHistoryProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(weeklyStatsProvider);
            ref.invalidate(shiftStatsProvider);
            ref.invalidate(orderHistoryProvider);
          },
          color: AppColors.primary,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
            children: [
              Text(AppStrings.tabStatistics, style: AppTypography.title.copyWith(fontSize: 26)),
              const SizedBox(height: 16),
              _PeriodTabs(
                value: _period,
                onChanged: (v) => setState(() => _period = v),
              ),
              const SizedBox(height: 22),
              weekly.when(
                loading: () => const Padding(
                  padding: EdgeInsets.symmetric(vertical: 48),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => EmptyState(
                  icon: Icons.error_outline,
                  title: '$e',
                  actionLabel: AppStrings.retry,
                  onAction: () => ref.invalidate(weeklyStatsProvider),
                ),
                data: (data) {
                  final today = shift.valueOrNull;
                  final amount = switch (_period) {
                    _EarningsPeriod.today => today?.todayEarnings ?? 0,
                    _EarningsPeriod.week => data.weekEarnings,
                    _EarningsPeriod.month => data.weekEarnings,
                  };
                  final title = switch (_period) {
                    _EarningsPeriod.today => AppStrings.todayEarnings,
                    _EarningsPeriod.week => AppStrings.weekEarningsTitle,
                    _EarningsPeriod.month => AppStrings.weekEarningsTitle,
                  };
                  final deliveries = switch (_period) {
                    _EarningsPeriod.today => today?.todayDeliveries ?? 0,
                    _EarningsPeriod.week => data.weekDeliveries,
                    _EarningsPeriod.month => data.weekDeliveries,
                  };
                  final avg = deliveries == 0 ? 0 : (amount / deliveries);

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: AppTypography.bodySmall),
                      const SizedBox(height: 6),
                      Text(
                        formatSum(amount),
                        style: AppTypography.display.copyWith(fontSize: 34),
                      ),
                      const SizedBox(height: 22),
                      if (data.days.isNotEmpty) _WeekBars(days: data.days),
                      const SizedBox(height: 22),
                      Row(
                        children: [
                          Expanded(
                            child: _MetricTile(
                              label: AppStrings.todayOrders,
                              value: '$deliveries',
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _MetricTile(
                              label: AppStrings.workHours,
                              value: '—',
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _MetricTile(
                              label: AppStrings.averagePerOrder,
                              value: formatSumNumber(avg),
                            ),
                          ),
                        ],
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 28),
              Row(
                children: [
                  Text(AppStrings.recentOrders, style: AppTypography.subtitle),
                  const Spacer(),
                  TextButton(
                    onPressed: () => context.push(AppRoutes.orderHistory),
                    child: Text(
                      AppStrings.seeAll,
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              history.when(
                loading: () => const SizedBox(
                  height: 80,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (_, __) => const SizedBox.shrink(),
                data: (orders) {
                  if (orders.isEmpty) {
                    return Text(AppStrings.noHistory, style: AppTypography.bodySmall);
                  }
                  return Column(
                    children: [
                      for (final order in orders.take(5))
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _RecentOrderRow(order: order),
                        ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PeriodTabs extends StatelessWidget {
  const _PeriodTabs({required this.value, required this.onChanged});

  final _EarningsPeriod value;
  final ValueChanged<_EarningsPeriod> onChanged;

  @override
  Widget build(BuildContext context) {
    final items = [
      (_EarningsPeriod.today, AppStrings.earningsPeriodToday),
      (_EarningsPeriod.week, AppStrings.earningsPeriodWeek),
      (_EarningsPeriod.month, AppStrings.earningsPeriodMonth),
    ];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          for (final item in items)
            Expanded(
              child: GestureDetector(
                onTap: () => onChanged(item.$1),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(vertical: 11),
                  decoration: BoxDecoration(
                    color: value == item.$1 ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    item.$2,
                    style: AppTypography.caption.copyWith(
                      color: value == item.$1 ? AppColors.onPrimary : AppColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _WeekBars extends StatelessWidget {
  const _WeekBars({required this.days});

  final List<CourierWeeklyDayModel> days;

  @override
  Widget build(BuildContext context) {
    final maxEarnings = days.fold<num>(0, (m, d) => d.earnings > m ? d.earnings : m);
    final safeMax = maxEarnings <= 0 ? 1 : maxEarnings;

    return SizedBox(
      height: 150,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (final day in days)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 3),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      day.earnings <= 0 ? '0' : formatSumNumber(day.earnings ~/ 1000),
                      style: AppTypography.caption.copyWith(fontSize: 10),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      height: 90 * (day.earnings / safeMax).clamp(0.08, 1.0),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _dayLabel(day.date),
                      style: AppTypography.caption.copyWith(fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _dayLabel(String raw) {
    final parsed = DateTime.tryParse(raw);
    if (parsed == null) return raw;
    const labels = ['', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    return labels[parsed.weekday];
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 14, 12, 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w800),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _RecentOrderRow extends StatelessWidget {
  const _RecentOrderRow({required this.order});

  final CourierOrderModel order;

  @override
  Widget build(BuildContext context) {
    final isStore = order.businessTypeSlug != null &&
        order.businessTypeSlug != 'restaurant' &&
        order.businessTypeSlug!.isNotEmpty;
    final time = order.createdAt != null
        ? DateFormat('HH:mm').format(order.createdAt!.toLocal())
        : '—';
    final distance = order.distanceKm != null
        ? '${order.distanceKm!.toStringAsFixed(1)} km'
        : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.surfaceHighlight,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              isStore ? Icons.store_mall_directory_outlined : Icons.restaurant_outlined,
              size: 20,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isStore ? AppStrings.storeOrder : AppStrings.restaurantOrder,
                  style: AppTypography.subtitle.copyWith(fontSize: 15),
                ),
                Text(
                  distance == null ? time : '$time · $distance',
                  style: AppTypography.caption,
                ),
              ],
            ),
          ),
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
