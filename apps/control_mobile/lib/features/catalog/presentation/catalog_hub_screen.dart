import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shell/control_vertical_scope.dart';
import 'catalog_screen.dart';
import 'store_categories_screen.dart';

/// Shared shell branch for dish catalog, store categories, or products.
class CatalogHubScreen extends ConsumerWidget {
  const CatalogHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scope = ref.watch(controlVerticalScopeProvider);
    final intent = ref.watch(catalogNavIntentProvider);

    if (intent == CatalogNavIntent.storeCategories ||
        (scope.isScoped &&
            !scope.isRestaurant &&
            intent == CatalogNavIntent.dishCategories)) {
      return const StoreCategoriesScreen(embedded: true);
    }

    final initialTab = intent == CatalogNavIntent.products ? 1 : 0;
    return CatalogScreen(initialTab: initialTab);
  }
}
