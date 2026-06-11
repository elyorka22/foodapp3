import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/jobs/job_service_type.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../home/providers/courier_home_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    final profile = ref.watch(courierProfileProvider);
    final earnings = ref.watch(courierEarningsProvider);
    final shiftOpen = ref.watch(shiftSessionOpenProvider);

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.profile)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          FoodAppCard(
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.primarySoft,
                  child: Text(
                    (user?.fullName ?? '?').substring(0, 1).toUpperCase(),
                    style: AppTypography.title.copyWith(color: AppColors.primary),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? '—', style: AppTypography.subtitle),
                      Text(user?.phone ?? '—', style: AppTypography.bodySmall),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: shiftOpen ? AppColors.online : AppColors.offline,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            shiftOpen ? AppStrings.online : AppStrings.offline,
                            style: AppTypography.caption.copyWith(
                              color: shiftOpen ? AppColors.online : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          earnings.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => const SizedBox.shrink(),
            data: (data) => Row(
              children: [
                Expanded(
                  child: FoodAppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(AppStrings.earned, style: AppTypography.caption),
                        const SizedBox(height: 4),
                        Text(
                          formatSum(data.totalEarnings),
                          style: AppTypography.subtitle.copyWith(color: AppColors.primary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: FoodAppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(AppStrings.deliveries, style: AppTypography.caption),
                        const SizedBox(height: 4),
                        Text('${data.completedAssignments}', style: AppTypography.subtitle),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          FoodAppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppStrings.serviceTypesTitle, style: AppTypography.caption),
                const SizedBox(height: 10),
                ...JobServiceType.values.map(
                  (t) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Icon(t.icon, color: t.color, size: 20),
                        const SizedBox(width: 10),
                        Text(t.label, style: AppTypography.body),
                        const Spacer(),
                        Text(
                          t.isAvailable ? AppStrings.serviceActive : AppStrings.serviceComingSoon,
                          style: AppTypography.caption.copyWith(
                            color: t.isAvailable ? AppColors.success : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          profile.when(
            data: (p) => FoodAppCard(
              child: Text(
                '${AppStrings.totalDeliveries}: ${p.totalDeliveries}',
                style: AppTypography.body,
              ),
            ),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
          const SizedBox(height: AppSpacing.md),
          _ProfileTile(
            icon: Icons.notifications_outlined,
            label: AppStrings.notifications,
            onTap: () => context.push(AppRoutes.notifications),
          ),
          _ProfileTile(
            icon: Icons.settings_outlined,
            label: AppStrings.notificationSettings,
            onTap: openAppSettings,
          ),
          const Divider(height: 24),
          _ProfileTile(
            icon: Icons.logout,
            label: AppStrings.logout,
            color: AppColors.danger,
            onTap: () async {
              await ref.read(authStateProvider.notifier).logout();
              if (context.mounted) context.go(AppRoutes.login);
            },
          ),
        ],
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  const _ProfileTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: color ?? AppColors.textSecondary),
      title: Text(label, style: TextStyle(color: color ?? AppColors.textPrimary)),
      trailing: Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
      onTap: onTap,
    );
  }
}
