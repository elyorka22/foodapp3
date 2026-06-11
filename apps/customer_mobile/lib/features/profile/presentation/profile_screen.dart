import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/providers/notifications_provider.dart';
import '../data/account_deletion_repository.dart';
import 'profile_banner_tile.dart';
import 'profile_social_section.dart';

const _bannerAddIcon = Icon(
  Icons.add,
  size: 48,
  color: Color(0xE6FFFFFF),
);
const _bannerRegisterIcon = Icon(
  Icons.person_add_alt_1_outlined,
  size: 40,
  color: Color(0xD9FF6B00),
);
const _bannerHelpIcon = Icon(
  Icons.help_outline_rounded,
  size: 40,
  color: AppColors.textMuted,
);
const _bannerPartnershipIcon = Icon(
  Icons.handshake_outlined,
  size: 40,
  color: AppColors.textSecondary,
);
const _bannerNotificationIcon = Icon(
  Icons.notifications_outlined,
  size: 40,
  color: Color(0x999CA3AF),
);

Future<void> _confirmDeleteAccount(
  BuildContext context,
  WidgetRef ref,
  String phone,
) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text(AppStrings.deleteAccountTitle),
      content: const Text(AppStrings.deleteAccountWarning),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text(AppStrings.deleteAccountCancel),
        ),
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text(
            AppStrings.deleteAccountConfirm,
            style: TextStyle(color: AppColors.danger),
          ),
        ),
      ],
    ),
  );
  if (confirmed != true || !context.mounted) return;

  try {
    await ref
        .read(accountDeletionRepositoryProvider)
        .deleteAccountAndLogout(phone: phone);
    ref.invalidate(authStateProvider);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.deleteAccountSuccess)),
      );
    }
  } catch (_) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.errorGeneric)),
      );
    }
  }
}

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final unreadAsync = ref.watch(notificationsUnreadProvider);
    final settingsAsync = ref.watch(publicSettingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: auth.when(
          data: (user) {
            final unread = unreadAsync.valueOrNull ?? 0;
            final displayName = user?.fullName ?? AppStrings.profileGuestName;
            final isLoggedIn = user != null;
            final settings = settingsAsync.valueOrNull;
            final socialLinks = ProfileSocialLinks(
              instagramUrl: settings?.socialInstagramUrl ?? '',
              telegramUrl: settings?.socialTelegramUrl ?? '',
              youtubeUrl: settings?.socialYoutubeUrl ?? '',
            );

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(authStateProvider);
                ref.invalidate(notificationsUnreadProvider);
                ref.invalidate(publicSettingsProvider);
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.md,
                  AppSpacing.lg,
                  AppSpacing.xxxl,
                ),
                child: Column(
                  children: [
                    _ProfileHeader(name: displayName),
                    const SizedBox(height: AppSpacing.xxl),
                    if (!isLoggedIn)
                      _GuestBannerGrid(
                        onLogin: () => context.push('/profile/login'),
                        onRegister: () => context.push('/profile/register'),
                        onHelp: () => context.push(AppRoutes.profileHelp),
                      )
                    else
                      _LoggedInBannerGrid(
                        unread: unread,
                        onNotifications: () =>
                            context.push(AppRoutes.notifications),
                        onHelp: () => context.push(AppRoutes.profileHelp),
                        onPartnership: () =>
                            context.push(AppRoutes.profilePartnership),
                      ),
                    ProfileSocialSection(links: socialLinks),
                    if (user != null) ...[
                      const SizedBox(height: AppSpacing.xl),
                      TextButton(
                        onPressed: () =>
                            ref.read(authStateProvider.notifier).logout(),
                        child: Text(
                          AppStrings.logout,
                          style: AppTypography.body.copyWith(
                            color: AppColors.danger,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      if (user.phone != null && user.phone!.isNotEmpty)
                        TextButton(
                          onPressed: () => _confirmDeleteAccount(
                            context,
                            ref,
                            user.phone!,
                          ),
                          child: Text(
                            AppStrings.deleteAccount,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        )
                      else
                        Padding(
                          padding: const EdgeInsets.only(top: AppSpacing.sm),
                          child: Text(
                            AppStrings.deleteAccountPhoneRequired,
                            textAlign: TextAlign.center,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                        ),
                    ],
                  ],
                ),
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              ref.invalidate(authStateProvider);
            });
            return const Center(child: CircularProgressIndicator());
          },
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          AppStrings.profileAccount,
          style: AppTypography.caption.copyWith(
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          name,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            height: 1.15,
            color: AppColors.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }
}

class _GuestBannerGrid extends StatelessWidget {
  const _GuestBannerGrid({
    required this.onLogin,
    required this.onRegister,
    required this.onHelp,
  });

  final VoidCallback onLogin;
  final VoidCallback onRegister;
  final VoidCallback onHelp;

  @override
  Widget build(BuildContext context) {
    return _BannerGrid(
      children: [
        ProfileBannerTile(
          variant: ProfileBannerVariant.accent,
          title: AppStrings.login,
          subtitle: AppStrings.profileLoginSubtitle,
          onTap: onLogin,
          bottomRight: _bannerAddIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.register,
          subtitle: AppStrings.profileRegisterSubtitle,
          onTap: onRegister,
          bottomRight: _bannerRegisterIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.help,
          subtitle: AppStrings.profileHelpSubtitle,
          onTap: onHelp,
          bottomRight: _bannerHelpIcon,
        ),
      ],
    );
  }
}

class _LoggedInBannerGrid extends StatelessWidget {
  const _LoggedInBannerGrid({
    required this.unread,
    required this.onNotifications,
    required this.onHelp,
    required this.onPartnership,
  });

  final int unread;
  final VoidCallback onNotifications;
  final VoidCallback onHelp;
  final VoidCallback onPartnership;

  @override
  Widget build(BuildContext context) {
    final unreadLabel = unread > 99 ? '99+' : '$unread';

    return _BannerGrid(
      children: [
        ProfileBannerTile(
          title: AppStrings.notificationsTitle,
          subtitle: AppStrings.profileNotificationsSubtitle,
          heroText: unread > 0 ? unreadLabel : null,
          heroColor: ProfileBannerTile.heroGreen,
          onTap: onNotifications,
          bottomRight: unread > 0 ? null : _bannerNotificationIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.help,
          subtitle: AppStrings.profileHelpSubtitle,
          onTap: onHelp,
          bottomRight: _bannerHelpIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.partnership,
          subtitle: AppStrings.profilePartnershipSubtitle,
          onTap: onPartnership,
          bottomRight: _bannerPartnershipIcon,
        ),
      ],
    );
  }
}

class _BannerGrid extends StatelessWidget {
  const _BannerGrid({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 0.92,
      children: children
          .map(
            (child) => SizedBox(
              height: 148,
              child: child,
            ),
          )
          .toList(),
    );
  }
}
