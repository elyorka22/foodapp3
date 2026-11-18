import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/providers/notifications_provider.dart';
import '../data/account_deletion_repository.dart';
import 'profile_social_section.dart';

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
            final isLoggedIn = user != null;
            final displayName = user?.fullName ?? AppStrings.profileGuestName;
            final settings = settingsAsync.valueOrNull;
            final socialLinks = ProfileSocialLinks(
              instagramUrl: settings?.socialInstagramUrl ?? '',
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
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _ProfileHeader(
                      name: displayName,
                      phone: user?.phone,
                      unread: unread,
                    ),
                    const SizedBox(height: 20),
                    if (!isLoggedIn) ...[
                      _MenuCard(
                        children: [
                          _MenuRow(
                            icon: Icons.login_rounded,
                            label: AppStrings.login,
                            hint: AppStrings.profileLoginSubtitle,
                            onTap: () => context.push('/profile/login'),
                          ),
                          _MenuRow(
                            icon: Icons.person_add_alt_1_rounded,
                            label: AppStrings.register,
                            hint: AppStrings.profileRegisterSubtitle,
                            onTap: () => context.push('/profile/register'),
                            showDivider: false,
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                    ],
                    _MenuCard(
                      children: [
                        _MenuRow(
                          icon: Icons.percent_rounded,
                          label: AppStrings.promotionsTitle,
                          onTap: () => context.push(AppRoutes.promotions),
                        ),
                        _MenuRow(
                          icon: Icons.notifications_none_rounded,
                          label: AppStrings.notificationsTitle,
                          trailing: unread > 0
                              ? (unread > 99 ? '99+' : '$unread')
                              : null,
                          onTap: () => context.push(AppRoutes.notifications),
                          showDivider: isLoggedIn,
                        ),
                        if (isLoggedIn)
                          _MenuRow(
                            icon: Icons.handshake_outlined,
                            label: AppStrings.partnership,
                            onTap: () =>
                                context.push(AppRoutes.profilePartnership),
                            showDivider: false,
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _MenuCard(
                      children: [
                        _MenuRow(
                          icon: Icons.headset_mic_outlined,
                          label: AppStrings.profileContact,
                          onTap: () => context.push(AppRoutes.profileHelp),
                        ),
                        _AppVersionRow(),
                      ],
                    ),
                    if (isLoggedIn) ...[
                      const SizedBox(height: 16),
                      InkWell(
                        onTap: () =>
                            ref.read(authStateProvider.notifier).logout(),
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 4,
                            vertical: 12,
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.logout_rounded,
                                size: 22,
                                color: AppColors.danger,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                AppStrings.logout,
                                style: AppTypography.body.copyWith(
                                  color: AppColors.danger,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                ),
                              ),
                            ],
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
                        ),
                    ],
                    ProfileSocialSection(links: socialLinks),
                  ],
                ),
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(AppStrings.errorGeneric, style: AppTypography.bodySmall),
                const SizedBox(height: AppSpacing.md),
                TextButton(
                  onPressed: () => ref.invalidate(authStateProvider),
                  child: const Text(AppStrings.retry),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.name,
    required this.unread,
    this.phone,
  });

  final String name;
  final String? phone;
  final int unread;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Expanded(
              child: Text(
                AppStrings.navProfile,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            IconButton(
              onPressed: () => context.push(AppRoutes.profileHelp),
              icon: const Icon(Icons.chat_bubble_outline_rounded, size: 22),
              color: AppColors.textPrimary,
            ),
            Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  onPressed: () => context.push(AppRoutes.notifications),
                  icon: const Icon(Icons.notifications_none_rounded, size: 24),
                  color: AppColors.textPrimary,
                ),
                if (unread > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 1,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.danger,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        unread > 99 ? '99+' : '$unread',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          name,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            height: 1.15,
            letterSpacing: -0.3,
            color: AppColors.textPrimary,
          ),
        ),
        if (phone != null && phone!.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            phone!,
            style: AppTypography.body.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
              fontSize: 15,
            ),
          ),
        ],
      ],
    );
  }
}

class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: Column(children: children),
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({
    required this.icon,
    required this.label,
    this.hint,
    this.trailing,
    this.onTap,
    this.showDivider = true,
  });

  final IconData icon;
  final String label;
  final String? hint;
  final String? trailing;
  final VoidCallback? onTap;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 56),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: showDivider
              ? const Border(
                  bottom: BorderSide(color: Color(0xFFF4F4F5)),
                )
              : null,
        ),
        child: Row(
          children: [
            Icon(icon, size: 22, color: AppColors.textPrimary),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  if (hint != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      hint!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (trailing != null)
              Text(
                trailing!,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF059669),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _AppVersionRow extends StatefulWidget {
  @override
  State<_AppVersionRow> createState() => _AppVersionRowState();
}

class _AppVersionRowState extends State<_AppVersionRow> {
  String _version = '';

  @override
  void initState() {
    super.initState();
    PackageInfo.fromPlatform().then((info) {
      if (!mounted) return;
      setState(() => _version = info.version);
    });
  }

  @override
  Widget build(BuildContext context) {
    return _MenuRow(
      icon: Icons.info_outline_rounded,
      label: AppStrings.profileAboutApp,
      hint: _version.isEmpty ? null : AppStrings.profileVersion(_version),
      showDivider: false,
    );
  }
}
