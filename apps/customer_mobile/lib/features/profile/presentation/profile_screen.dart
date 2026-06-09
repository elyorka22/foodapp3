import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/providers/notifications_provider.dart';
import 'profile_banner_tile.dart';

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
const _bannerTelegramIcon = Icon(
  Icons.telegram,
  size: 44,
  color: Color(0xFF229ED9),
);
const _bannerHelpIcon = Icon(
  Icons.help_outline_rounded,
  size: 40,
  color: AppColors.textMuted,
);
const _bannerTermsIcon = Icon(
  Icons.description_outlined,
  size: 40,
  color: AppColors.textMuted,
);
const _bannerLanguageIcon = Icon(
  Icons.language,
  size: 40,
  color: AppColors.textSecondary,
);
const _bannerNotificationIcon = Icon(
  Icons.notifications_outlined,
  size: 40,
  color: Color(0x999CA3AF),
);

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);
    final unreadAsync = ref.watch(notificationsUnreadProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: auth.when(
          data: (user) {
            final unread = unreadAsync.valueOrNull ?? 0;
            final displayName = user?.fullName ?? AppStrings.profileGuestName;
            final initial = displayName.isNotEmpty
                ? displayName.trim()[0].toUpperCase()
                : '?';

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(authStateProvider);
                ref.invalidate(notificationsUnreadProvider);
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
                    _ProfileHeader(
                      initial: initial,
                      name: displayName,
                      badgeCount: user != null && unread > 0 ? unread : null,
                    ),
                    const SizedBox(height: AppSpacing.xxl),
                    if (user == null)
                      _GuestBannerGrid(
                        onLogin: () => context.push('/profile/login'),
                        onRegister: () => context.push('/profile/register'),
                        onTelegram: () => context.push('/profile/telegram'),
                        onHelp: () {},
                      )
                    else
                      _LoggedInBannerGrid(
                        unread: unread,
                        onNotifications: () =>
                            context.push(AppRoutes.notifications),
                        onPromotions: () => context.push(AppRoutes.promotions),
                        onLanguage: () {},
                        onHelp: () {},
                        onTerms: () {},
                        onTelegram: () => context.push('/profile/telegram'),
                      ),
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
                    ],
                    const SizedBox(height: AppSpacing.sm),
                    TextButton(
                      onPressed: () => context.push(AppRoutes.networkHealth),
                      child: Text(
                        'Tarmoq diagnostikasi',
                        style: AppTypography.caption,
                      ),
                    ),
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
  const _ProfileHeader({
    required this.initial,
    required this.name,
    this.badgeCount,
  });

  final String initial;
  final String name;
  final int? badgeCount;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            CircleAvatar(
              radius: 44,
              backgroundColor: AppColors.primarySoft,
              child: Text(
                initial,
                style: AppTypography.display.copyWith(
                  fontSize: 32,
                  color: AppColors.primary,
                ),
              ),
            ),
            if (badgeCount != null)
              Positioned(
                top: -2,
                right: -2,
                child: Container(
                  constraints: const BoxConstraints(minWidth: 22, minHeight: 22),
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFC107),
                    borderRadius: BorderRadius.circular(11),
                    border: Border.all(color: AppColors.surface, width: 2),
                  ),
                  child: Text(
                    badgeCount! > 99 ? '99+' : '$badgeCount',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
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
    required this.onTelegram,
    required this.onHelp,
  });

  final VoidCallback onLogin;
  final VoidCallback onRegister;
  final VoidCallback onTelegram;
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
          title: AppStrings.telegramLogin,
          subtitle: AppStrings.profileTelegramSubtitle,
          onTap: onTelegram,
          bottomRight: _bannerTelegramIcon,
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
    required this.onPromotions,
    required this.onLanguage,
    required this.onHelp,
    required this.onTerms,
    required this.onTelegram,
  });

  final int unread;
  final VoidCallback onNotifications;
  final VoidCallback onPromotions;
  final VoidCallback onLanguage;
  final VoidCallback onHelp;
  final VoidCallback onTerms;
  final VoidCallback onTelegram;

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
          variant: ProfileBannerVariant.accent,
          title: AppStrings.promotionsTitle,
          subtitle: AppStrings.profilePromotionsSubtitle,
          onTap: onPromotions,
          bottomRight: _bannerAddIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.language,
          subtitle: AppStrings.profileLanguageSubtitle,
          onTap: onLanguage,
          bottomRight: _bannerLanguageIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.help,
          subtitle: AppStrings.profileHelpSubtitle,
          onTap: onHelp,
          bottomRight: _bannerHelpIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.terms,
          subtitle: AppStrings.profileTermsSubtitle,
          onTap: onTerms,
          bottomRight: _bannerTermsIcon,
        ),
        ProfileBannerTile(
          title: AppStrings.telegramLogin,
          subtitle: AppStrings.profileTelegramSubtitle,
          onTap: onTelegram,
          bottomRight: _bannerTelegramIcon,
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
