import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/public_settings_provider.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/cities/presentation/city_selector.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class HomeHeadline extends ConsumerWidget {
  const HomeHeadline({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(publicSettingsProvider);

    return settings.when(
      loading: () => Row(
        children: [
          Expanded(
            child: Container(
              height: 28,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          const _BellButton(),
        ],
      ),
      error: (_, __) => const _HeadlineRow(subtitle: null),
      data: (s) => _HeadlineRow(
        subtitle: s.homeSubtitle.trim().isNotEmpty ? s.homeSubtitle : null,
      ),
    );
  }
}

class _HeadlineRow extends StatelessWidget {
  const _HeadlineRow({this.subtitle});

  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const CitySelector(),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(subtitle!, style: AppTypography.bodySmall),
              ],
            ],
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        const _BellButton(),
      ],
    );
  }
}

class _BellButton extends ConsumerWidget {
  const _BellButton();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;

    return Material(
      color: Colors.white,
      elevation: 1,
      shadowColor: Colors.black26,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: () {
          if (user == null) {
            context.push('/profile/login');
            return;
          }
          context.push(AppRoutes.notifications);
        },
        child: const SizedBox(
          width: 44,
          height: 44,
          child: Icon(Icons.notifications_outlined, color: AppColors.textPrimary),
        ),
      ),
    );
  }
}
