import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/audio/alert_preferences.dart';
import '../../../core/jobs/job_service_type.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/app_atmosphere.dart';
import '../../../shared/widgets/metric_block.dart';
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
    final alertPrefs = ref.watch(alertPreferencesProvider);

    return Scaffold(
      body: AppAtmosphere(
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              title: const Text(AppStrings.profile),
              backgroundColor: AppColors.background.withValues(alpha: 0.92),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.sm,
                AppSpacing.lg,
                AppSpacing.xxl,
              ),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 30,
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
                            Text(user?.fullName ?? '—', style: AppTypography.title.copyWith(fontSize: 20)),
                            const SizedBox(height: 2),
                            Text(user?.phone ?? '—', style: AppTypography.bodySmall),
                            const SizedBox(height: 8),
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
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  earnings.when(
                    loading: () => const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (data) => MetricRow(
                      children: [
                        MetricBlock(
                          label: AppStrings.earned,
                          value: formatSum(data.totalEarnings),
                          accent: true,
                          icon: Icons.payments_outlined,
                        ),
                        MetricBlock(
                          label: AppStrings.deliveries,
                          value: '${data.completedAssignments}',
                          icon: Icons.check_circle_outline,
                        ),
                      ],
                    ),
                  ),
                  profile.when(
                    data: (p) => Padding(
                      padding: const EdgeInsets.only(top: AppSpacing.lg),
                      child: Text(
                        '${AppStrings.totalDeliveries}: ${p.totalDeliveries}',
                        style: AppTypography.bodySmall,
                      ),
                    ),
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  Text(AppStrings.serviceTypesTitle, style: AppTypography.caption),
                  const SizedBox(height: AppSpacing.md),
                  ...JobServiceType.values.map(
                    (t) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Icon(t.icon, color: t.color, size: 20),
                          const SizedBox(width: 12),
                          Expanded(child: Text(t.label, style: AppTypography.body)),
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
                  const SizedBox(height: AppSpacing.lg),
                  const Divider(),
                  const SizedBox(height: AppSpacing.md),
                  Text(AppStrings.alertSettings, style: AppTypography.subtitle),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(AppStrings.alertSound, style: AppTypography.body),
                    activeThumbColor: AppColors.primary,
                    activeTrackColor: AppColors.primary.withValues(alpha: 0.35),
                    value: alertPrefs.soundEnabled,
                    onChanged: (v) =>
                        ref.read(alertPreferencesProvider.notifier).setSoundEnabled(v),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(AppStrings.alertVibration, style: AppTypography.body),
                    activeThumbColor: AppColors.primary,
                    activeTrackColor: AppColors.primary.withValues(alpha: 0.35),
                    value: alertPrefs.vibrationEnabled,
                    onChanged: (v) =>
                        ref.read(alertPreferencesProvider.notifier).setVibrationEnabled(v),
                  ),
                  const Divider(),
                  _ProfileTile(
                    icon: Icons.history_rounded,
                    label: AppStrings.orderHistory,
                    onTap: () => context.push(AppRoutes.orderHistory),
                  ),
                  _ProfileTile(
                    icon: Icons.notifications_none_rounded,
                    label: AppStrings.notifications,
                    onTap: () => context.push(AppRoutes.notifications),
                  ),
                  const _NotificationSettingsTile(),
                  const SizedBox(height: AppSpacing.md),
                  _ProfileTile(
                    icon: Icons.logout_rounded,
                    label: AppStrings.logout,
                    color: AppColors.danger,
                    onTap: () async {
                      await ref.read(authStateProvider.notifier).logout();
                      if (context.mounted) context.go(AppRoutes.login);
                    },
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationSettingsTile extends StatelessWidget {
  const _NotificationSettingsTile();

  @override
  Widget build(BuildContext context) {
    return const _ProfileTile(
      icon: Icons.settings_outlined,
      label: AppStrings.notificationSettings,
      onTap: openAppSettings,
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
      title: Text(
        label,
        style: AppTypography.body.copyWith(color: color ?? AppColors.textPrimary),
      ),
      trailing: Icon(
        Icons.chevron_right_rounded,
        color: color ?? AppColors.textMuted,
        size: 20,
      ),
      onTap: onTap,
    );
  }
}
