import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.profile)),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (user != null) ...[
              Text(user.fullName, style: AppTypography.title),
              const SizedBox(height: AppSpacing.sm),
              if (user.phone != null) Text(user.phone!, style: AppTypography.body),
              const SizedBox(height: AppSpacing.sm),
              Text(
                user.isRestaurant ? AppStrings.restaurantPanel : AppStrings.managerPanel,
                style: AppTypography.bodySmall,
              ),
            ],
            const Spacer(),
            FoodAppButton(
              label: AppStrings.logout,
              variant: FoodAppButtonVariant.danger,
              onPressed: () async {
                await ref.read(authStateProvider.notifier).logout();
                if (context.mounted) context.go(AppRoutes.login);
              },
            ),
          ],
        ),
      ),
    );
  }
}
