import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/audio/alert_preferences.dart';
import '../../../core/jobs/job_service_type.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/widgets/courier_avatar.dart';
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
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          children: [
            Text(AppStrings.profile, style: AppTypography.title.copyWith(fontSize: 26)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  CourierAvatar(name: user?.fullName, size: 64),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.fullName ?? '—',
                          style: AppTypography.title.copyWith(fontSize: 20),
                        ),
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
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              '4,9 · ${AppStrings.vehicleScooter}',
                              style: AppTypography.caption,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            earnings.when(
              loading: () => const SizedBox(
                height: 88,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (_, __) => const SizedBox.shrink(),
              data: (data) => Row(
                children: [
                  Expanded(
                    child: _ProfileMetric(
                      label: AppStrings.earned,
                      value: formatSumNumber(data.totalEarnings),
                      unit: AppStrings.currencySom,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _ProfileMetric(
                      label: AppStrings.deliveries,
                      value: '${data.completedAssignments}',
                      unit: AppStrings.unitOrders,
                    ),
                  ),
                ],
              ),
            ),
            profile.when(
              data: (p) => Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(
                  '${AppStrings.totalDeliveries}: ${p.totalDeliveries}',
                  style: AppTypography.bodySmall,
                ),
              ),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 22),
            Text(AppStrings.serviceTypesTitle, style: AppTypography.subtitle),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  for (final t in JobServiceType.values)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        children: [
                          Icon(t.icon, color: t.color, size: 20),
                          const SizedBox(width: 12),
                          Expanded(child: Text(t.label, style: AppTypography.body)),
                          Text(
                            t.isAvailable
                                ? AppStrings.serviceActive
                                : AppStrings.serviceComingSoon,
                            style: AppTypography.caption.copyWith(
                              color: t.isAvailable ? AppColors.success : AppColors.textMuted,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            Text(AppStrings.alertSettings, style: AppTypography.subtitle),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: Text(AppStrings.alertSound, style: AppTypography.body),
                    activeThumbColor: AppColors.primary,
                    activeTrackColor: AppColors.primary.withValues(alpha: 0.35),
                    value: alertPrefs.soundEnabled,
                    onChanged: (v) =>
                        ref.read(alertPreferencesProvider.notifier).setSoundEnabled(v),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: Text(AppStrings.alertVibration, style: AppTypography.body),
                    activeThumbColor: AppColors.primary,
                    activeTrackColor: AppColors.primary.withValues(alpha: 0.35),
                    value: alertPrefs.vibrationEnabled,
                    onChanged: (v) =>
                        ref.read(alertPreferencesProvider.notifier).setVibrationEnabled(v),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _ProfileTile(
                    icon: Icons.history_rounded,
                    label: AppStrings.orderHistory,
                    onTap: () => context.push(AppRoutes.orderHistory),
                  ),
                  const Divider(height: 1),
                  _ProfileTile(
                    icon: Icons.notifications_none_rounded,
                    label: AppStrings.notifications,
                    onTap: () => context.push(AppRoutes.notifications),
                  ),
                  const Divider(height: 1),
                  const _ProfileTile(
                    icon: Icons.settings_outlined,
                    label: AppStrings.notificationSettings,
                    onTap: openAppSettings,
                  ),
                  const Divider(height: 1),
                  _ProfileTile(
                    icon: Icons.logout_rounded,
                    label: AppStrings.logout,
                    color: AppColors.danger,
                    onTap: () async {
                      await ref.read(authStateProvider.notifier).logout();
                      if (context.mounted) context.go(AppRoutes.login);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileMetric extends StatelessWidget {
  const _ProfileMetric({
    required this.label,
    required this.value,
    required this.unit,
  });

  final String label;
  final String value;
  final String unit;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTypography.title.copyWith(fontSize: 22),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(unit, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
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
