import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../restaurant/data/restaurant_repository.dart';

final restaurantsListProvider = FutureProvider.autoDispose<List<RestaurantModel>>((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchAllRestaurants();
});

class ManagerRestaurantsScreen extends ConsumerWidget {
  const ManagerRestaurantsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurants = ref.watch(restaurantsListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.managerRestaurantNew),
        icon: const Icon(Icons.add),
        label: const Text(AppStrings.createRestaurant),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(restaurantsListProvider),
        child: ListView(
          padding: const EdgeInsets.only(bottom: 88),
          children: [
            const ScreenHeader(
              title: AppStrings.restaurants,
              subtitle: 'Restoranlar va menyularni boshqaring',
            ),
            restaurants.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => ErrorState(
                message: ApiException.formatError(e),
                onRetry: () => ref.invalidate(restaurantsListProvider),
              ),
              data: (list) {
                if (list.isEmpty) {
                  return EmptyState(
                    icon: Icons.storefront_outlined,
                    title: AppStrings.noRestaurants,
                    actionLabel: AppStrings.createRestaurant,
                    onAction: () => context.push(AppRoutes.managerRestaurantNew),
                  );
                }
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Column(
                    children: list.map((r) => AppCard(
                          onTap: () => context.push(AppRoutes.managerRestaurantEdit(r.id)),
                          child: Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: AppColors.primarySoft,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: const Icon(Icons.storefront, color: AppColors.primary),
                              ),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(r.name, style: AppTypography.subtitle),
                                    if (r.phone != null)
                                      Text(r.phone!, style: AppTypography.bodySmall),
                                    if (r.branchAddress != null)
                                      Text(
                                        r.branchAddress!,
                                        style: AppTypography.caption,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                  ],
                                ),
                              ),
                              Column(
                                children: [
                                  Icon(
                                    r.isActive ? Icons.check_circle : Icons.block,
                                    color: r.isActive ? AppColors.success : AppColors.danger,
                                    size: 20,
                                  ),
                                  const SizedBox(height: 8),
                                  IconButton(
                                    onPressed: () => context.push(
                                      AppRoutes.managerRestaurantMenu(r.id),
                                    ),
                                    icon: const Icon(Icons.restaurant_menu_outlined),
                                    tooltip: AppStrings.manageMenu,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )).toList(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
