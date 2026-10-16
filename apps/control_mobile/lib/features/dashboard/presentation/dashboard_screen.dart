import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/layout/breakpoints.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/placeholder_banner.dart';
import '../../../shared/widgets/summary_card.dart';
import '../../auth/providers/auth_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    final wide = Breakpoints.isWide(context);
    final compact = Breakpoints.isCompact(context);
    final crossAxisCount = wide ? 4 : (compact ? 2 : 3);

    return ListView(
      padding: EdgeInsets.all(compact ? AppSpacing.lg : AppSpacing.xxl),
      children: [
        Text(AppStrings.dashboardTitle, style: AppTypography.display),
        const SizedBox(height: 6),
        Text(
          '${AppStrings.dashboardWelcome}'
          '${user?.fullName.isNotEmpty == true ? ', ${user!.fullName}' : ''}',
          style: AppTypography.bodySmall,
        ),
        const SizedBox(height: 16),
        const PlaceholderBanner(),
        const SizedBox(height: 8),
        Text(AppStrings.apiReadyHint, style: AppTypography.caption),
        const SizedBox(height: 20),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: crossAxisCount,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: compact ? 1.35 : 1.55,
          children: [
            SummaryCard(
              title: AppStrings.cardEmployees,
              value: '—',
              icon: Icons.badge_outlined,
              onTap: () => context.go(AppRoutes.employees),
            ),
            SummaryCard(
              title: AppStrings.cardBusinesses,
              value: '—',
              icon: Icons.storefront_outlined,
              onTap: () => context.go(AppRoutes.businesses),
            ),
            SummaryCard(
              title: AppStrings.cardOrders,
              value: '—',
              icon: Icons.receipt_long_outlined,
              onTap: () => context.go(AppRoutes.orders),
            ),
            SummaryCard(
              title: AppStrings.cardOpenIssues,
              value: '—',
              icon: Icons.warning_amber_outlined,
              onTap: () => context.go(AppRoutes.audit),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Text(AppStrings.navEmployees, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final entry in [
              (AppStrings.navEmployees, AppRoutes.employees),
              (AppStrings.navBusinesses, AppRoutes.businesses),
              (AppStrings.navOrders, AppRoutes.orders),
              (AppStrings.navCatalog, AppRoutes.catalog),
              (AppStrings.navPromotions, AppRoutes.promotions),
              (AppStrings.navSettings, AppRoutes.settings),
              (AppStrings.navAudit, AppRoutes.audit),
            ])
              ActionChip(
                label: Text(entry.$1),
                onPressed: () => context.go(entry.$2),
              ),
          ],
        ),
      ],
    );
  }
}
