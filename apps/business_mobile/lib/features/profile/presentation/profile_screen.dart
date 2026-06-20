import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../auth/providers/auth_provider.dart';
import '../../restaurant/data/restaurant_repository.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authStateProvider).valueOrNull;
    final restaurant = user?.isRestaurant == true
        ? ref.watch(_myRestaurantProvider)
        : const AsyncValue.data(null);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppSpacing.lg),
              Center(
                child: CircleAvatar(
                  radius: 40,
                  backgroundColor: AppColors.primarySoft,
                  child: Text(
                    (user?.fullName ?? '?').characters.first.toUpperCase(),
                    style: AppTypography.title.copyWith(
                      color: AppColors.primary,
                      fontSize: 28,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                user?.fullName ?? '—',
                textAlign: TextAlign.center,
                style: AppTypography.title,
              ),
              const SizedBox(height: 4),
              Text(
                user?.isRestaurant == true
                    ? AppStrings.restaurantPanel
                    : AppStrings.managerPanel,
                textAlign: TextAlign.center,
                style: AppTypography.bodySmall,
              ),
              if (user?.phone != null) ...[
                const SizedBox(height: 4),
                Text(
                  user!.phone!,
                  textAlign: TextAlign.center,
                  style: AppTypography.body,
                ),
              ],
              const SizedBox(height: AppSpacing.xxl),
              if (user?.isRestaurant == true)
                restaurant.when(
                  data: (r) => r != null
                      ? AppCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r.name, style: AppTypography.subtitle),
                              if (r.phone != null) ...[
                                const SizedBox(height: 4),
                                Text(r.phone!, style: AppTypography.bodySmall),
                              ],
                              if (r.branchAddress != null) ...[
                                const SizedBox(height: 4),
                                Text(r.branchAddress!, style: AppTypography.caption),
                              ],
                            ],
                          ),
                        )
                      : const SizedBox.shrink(),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              const Spacer(),
              FoodAppButton(
                label: AppStrings.notifications,
                variant: FoodAppButtonVariant.secondary,
                onPressed: () => context.push(AppRoutes.notifications),
              ),
              const SizedBox(height: AppSpacing.md),
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
      ),
    );
  }
}

final _myRestaurantProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchMyRestaurant();
});
