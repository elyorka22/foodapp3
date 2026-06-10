import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
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

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.profile)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          FoodAppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.fullName ?? '—',
                  style: AppTypography.subtitle,
                ),
                const SizedBox(height: 4),
                Text(user?.phone ?? '—', style: AppTypography.bodySmall),
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
                          style: AppTypography.subtitle.copyWith(
                            color: AppColors.primary,
                          ),
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
                        Text(
                          '${data.completedAssignments}',
                          style: AppTypography.subtitle,
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
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('${AppStrings.deliveries}: ${p.totalDeliveries}'),
                subtitle: Text(p.isOnline ? AppStrings.online : AppStrings.offline),
              ),
            ),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
          const SizedBox(height: AppSpacing.lg),
          ListTile(
            leading: const Icon(Icons.notifications_outlined),
            title: const Text(AppStrings.notifications),
            onTap: () => context.push(AppRoutes.notifications),
          ),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: const Text(AppStrings.notificationSettings),
            onTap: () => openAppSettings(),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text(AppStrings.logout),
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
