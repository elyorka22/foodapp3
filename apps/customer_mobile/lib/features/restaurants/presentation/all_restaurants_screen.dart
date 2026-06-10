import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/food_app_restaurant_card.dart';
import '../providers/restaurants_provider.dart';

class AllRestaurantsScreen extends ConsumerWidget {
  const AllRestaurantsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurants = ref.watch(restaurantsListProvider(null));

    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.allRestaurants)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(restaurantsListProvider);
        },
        child: restaurants.when(
          data: (list) {
            if (list.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Text(AppStrings.errorGeneric, style: AppTypography.body),
                  ),
                ],
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (_, index) {
                final restaurant = list[index];
                return FoodAppRestaurantCard(
                  restaurant: restaurant,
                  onTap: () => context.go('/restaurants/${restaurant.slug}'),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Text(
                  ApiException.formatError(e),
                  style: AppTypography.bodySmall,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
