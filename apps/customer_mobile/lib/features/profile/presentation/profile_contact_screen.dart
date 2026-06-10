import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/config/public_settings_provider.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/customer_page.dart';
import '../../../shared/widgets/food_app_button.dart';

enum ProfileContactKind { help, partnership }

class ProfileContactScreen extends ConsumerWidget {
  const ProfileContactScreen({
    super.key,
    required this.kind,
  });

  final ProfileContactKind kind;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(publicSettingsProvider);

    return settings.when(
      data: (data) {
        final isHelp = kind == ProfileContactKind.help;
        final title = isHelp ? AppStrings.help : AppStrings.partnership;
        final telegramUrl = isHelp ? data.helpTelegramUrl : data.partnershipTelegramUrl;
        final telegramLabel =
            isHelp ? data.helpTelegramLabel : data.partnershipTelegramLabel;
        final phone = isHelp ? '' : data.partnershipPhone;

        return CustomerPage(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      title,
                      style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              CustomerCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      AppStrings.contactViaTelegram,
                      style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    if (telegramUrl.isNotEmpty)
                      _ContactTile(
                        icon: Icons.send_rounded,
                        iconColor: const Color(0xFF229ED9),
                        backgroundColor: const Color(0xFFE8F7FD),
                        label: telegramLabel.isNotEmpty
                            ? telegramLabel
                            : AppStrings.openTelegram,
                        onTap: () => _openUrl(context, telegramUrl),
                      )
                    else
                      Text(
                        AppStrings.contactNotConfigured,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                    if (!isHelp && phone.trim().isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.xl),
                      Text(
                        AppStrings.contactViaPhone,
                        style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _ContactTile(
                        icon: Icons.phone_outlined,
                        iconColor: AppColors.primary,
                        backgroundColor: AppColors.primarySoft,
                        label: phone.trim(),
                        onTap: () => _openUrl(
                          context,
                          Uri(scheme: 'tel', path: phone.replaceAll(' ', '')).toString(),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              FoodAppButton(
                label: AppStrings.back,
                variant: FoodAppButtonVariant.secondary,
                onPressed: () => context.pop(),
              ),
            ],
          ),
        );
      },
      loading: () => const CustomerPage(
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => CustomerPage(
        title: AppStrings.help,
        child: Text(AppStrings.errorGeneric, style: AppTypography.bodySmall),
      ),
    );
  }

  Future<void> _openUrl(BuildContext context, String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null || !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(url)),
      );
    }
  }
}

class _ContactTile extends StatelessWidget {
  const _ContactTile({
    required this.icon,
    required this.iconColor,
    required this.backgroundColor,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final Color iconColor;
  final Color backgroundColor;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Icon(icon, color: iconColor, size: 22),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  label,
                  style: AppTypography.body.copyWith(
                    fontWeight: FontWeight.w600,
                    color: iconColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
