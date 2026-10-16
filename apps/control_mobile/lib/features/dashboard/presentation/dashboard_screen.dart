import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/layout/breakpoints.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../../shared/widgets/summary_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/dashboard_model.dart';
import '../data/dashboard_repository.dart';

final dashboardProvider = FutureProvider.autoDispose<DashboardMetrics>((ref) {
  return ref.watch(dashboardRepositoryProvider).fetchDashboard();
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    final async = ref.watch(dashboardProvider);
    final wide = Breakpoints.isWide(context);
    final compact = Breakpoints.isCompact(context);
    final crossAxisCount = wide ? 4 : (compact ? 2 : 3);

    return AsyncPageBody<DashboardMetrics>(
      asyncValue: async,
      onRefresh: () => ref.refresh(dashboardProvider.future),
      padding: EdgeInsets.all(compact ? AppSpacing.lg : AppSpacing.xxl),
      dataBuilder: (metrics) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(AppStrings.dashboardTitle, style: AppTypography.display),
            const SizedBox(height: 6),
            Text(
              '${AppStrings.dashboardWelcome}'
              '${user?.fullName.isNotEmpty == true ? ', ${user!.fullName}' : ''}',
              style: AppTypography.bodySmall,
            ),
            const SizedBox(height: 20),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: crossAxisCount,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: compact ? 1.15 : 1.35,
              children: [
                SummaryCard(
                  title: AppStrings.cardTodayOrders,
                  value: '${metrics.todayOrders}',
                  icon: Icons.receipt_long_outlined,
                  isPlaceholder: false,
                  onTap: () => context.go(AppRoutes.orders),
                ),
                SummaryCard(
                  title: AppStrings.cardPending,
                  value: '${metrics.pendingOrders}',
                  icon: Icons.hourglass_top_outlined,
                  isPlaceholder: false,
                  onTap: () => context.go(AppRoutes.orders),
                ),
                SummaryCard(
                  title: AppStrings.cardRevenueToday,
                  value: formatMoney(metrics.revenueToday),
                  icon: Icons.payments_outlined,
                  isPlaceholder: false,
                ),
                SummaryCard(
                  title: AppStrings.cardRevenueMonth,
                  value: formatMoney(metrics.revenueMonth),
                  icon: Icons.trending_up,
                  isPlaceholder: false,
                ),
                SummaryCard(
                  title: AppStrings.cardActiveRestaurants,
                  value: '${metrics.activeRestaurants}',
                  icon: Icons.restaurant_outlined,
                  isPlaceholder: false,
                  onTap: () => context.go(AppRoutes.businesses),
                ),
                SummaryCard(
                  title: AppStrings.cardActiveStores,
                  value: '${metrics.activeStores}',
                  icon: Icons.storefront_outlined,
                  isPlaceholder: false,
                  onTap: () => context.go(AppRoutes.businesses),
                ),
                SummaryCard(
                  title: AppStrings.cardCouriers,
                  value: '${metrics.activeCouriers}',
                  icon: Icons.delivery_dining_outlined,
                  isPlaceholder: false,
                ),
                SummaryCard(
                  title: AppStrings.cardDelivered,
                  value: '${metrics.deliveredOrders}',
                  icon: Icons.check_circle_outline,
                  isPlaceholder: false,
                ),
              ],
            ),
            const SizedBox(height: 28),
            Row(
              children: [
                Text(AppStrings.recentOrders, style: AppTypography.subtitle),
                const Spacer(),
                TextButton(
                  onPressed: () => context.go(AppRoutes.orders),
                  child: const Text(AppStrings.navOrders),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (metrics.recentOrders.isEmpty)
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                ),
                child: Text(
                  AppStrings.emptyList,
                  style: AppTypography.bodySmall,
                ),
              )
            else
              ...metrics.recentOrders.take(8).map((o) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: ControlListCard(
                    title: o.orderNumber.isNotEmpty ? o.orderNumber : o.id,
                    subtitle: [
                      if (o.businessName != null) o.businessName!,
                      formatMoney(o.total),
                      if (o.createdAt != null) formatDateTime(o.createdAt),
                    ].join(' · '),
                    trailing: StatusChip(status: o.status),
                    onTap: () => context.go(AppRoutes.orders),
                  ),
                );
              }),
          ],
        );
      },
    );
  }
}
