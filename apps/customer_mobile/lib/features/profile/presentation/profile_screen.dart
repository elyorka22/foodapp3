import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_button.dart' show FoodAppButton, FoodAppButtonVariant;
import '../../../shared/widgets/food_app_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/providers/notifications_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final unreadAsync = ref.watch(notificationsUnreadProvider);

    return Scaffold(
      appBar: AppBar(title: Text(AppStrings.navProfile, style: AppTypography.title)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          auth.when(
            data: (user) {
              if (user == null) {
                return FoodAppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(AppStrings.guestBrowse, style: AppTypography.body),
                      const SizedBox(height: AppSpacing.lg),
                      FoodAppButton(
                        label: AppStrings.login,
                        onPressed: () => context.push('/profile/login'),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      FoodAppButton(
                        label: AppStrings.register,
                        variant: FoodAppButtonVariant.secondary,
                        onPressed: () => context.push('/profile/register'),
                      ),
                    ],
                  ),
                );
              }
              return FoodAppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user.fullName, style: AppTypography.title),
                    if (user.phone != null)
                      Text(user.phone!, style: AppTypography.bodySmall),
                    const SizedBox(height: AppSpacing.md),
                    FoodAppButton(
                      label: AppStrings.logout,
                      variant: FoodAppButtonVariant.secondary,
                      onPressed: () => ref.read(authStateProvider.notifier).logout(),
                    ),
                  ],
                ),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('$e'),
          ),
          const SizedBox(height: AppSpacing.lg),
          auth.when(
            data: (user) {
              if (user == null) return const SizedBox.shrink();
              final unread = unreadAsync.valueOrNull ?? 0;
              return _MenuTile(
                icon: Icons.notifications_outlined,
                title: AppStrings.notificationsTitle,
                badge: unread > 0 ? unread : null,
                onTap: () => context.push(AppRoutes.notifications),
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
          _MenuTile(
            icon: Icons.telegram,
            title: AppStrings.telegramLogin,
            onTap: () => context.push('/profile/telegram'),
          ),
          _MenuTile(icon: Icons.language, title: AppStrings.language, onTap: () {}),
          _MenuTile(icon: Icons.help_outline, title: AppStrings.help, onTap: () {}),
          _MenuTile(icon: Icons.description_outlined, title: AppStrings.terms, onTap: () {}),
        ],
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.badge,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final int? badge;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: badge != null
            ? CircleAvatar(
                radius: 12,
                backgroundColor: const Color(0xFFE85D04),
                child: Text(
                  badge! > 99 ? '99+' : '$badge',
                  style: const TextStyle(color: Colors.white, fontSize: 11),
                ),
              )
            : const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
