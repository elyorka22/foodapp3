import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../business_types/data/business_types_repository.dart';

/// Marketplace vertical currently applied to list screens in the shell.
class ControlVerticalScope {
  const ControlVerticalScope({
    this.slug,
    this.name,
    this.isRestaurant = false,
  });

  /// null = unscoped (all verticals).
  final String? slug;
  final String? name;
  final bool isRestaurant;

  static const all = ControlVerticalScope();

  static const restaurant = ControlVerticalScope(
    slug: 'restaurant',
    name: 'Restoranlar',
    isRestaurant: true,
  );

  factory ControlVerticalScope.marketplace(ControlBusinessType type) {
    return ControlVerticalScope(
      slug: type.slug ?? type.id,
      name: type.name,
      isRestaurant: false,
    );
  }

  bool get isScoped => slug != null && slug!.trim().isNotEmpty;

  Map<String, dynamic> restaurantQuery() {
    if (!isScoped) return {};
    if (isRestaurant) return {'vertical': 'restaurant'};
    return {'type': slug};
  }

  Map<String, dynamic> ordersQuery() {
    if (!isScoped) return {};
    if (isRestaurant) return {'vertical': 'restaurant'};
    return {'businessType': slug};
  }

  Map<String, dynamic> storeListQuery() {
    if (!isScoped || isRestaurant) return {'vertical': 'store'};
    return {'type': slug};
  }
}

/// Which catalog surface to show inside the shared catalog shell branch.
enum CatalogNavIntent {
  dishCategories,
  products,
  storeCategories,
}

final controlVerticalScopeProvider =
    StateProvider<ControlVerticalScope>((ref) => ControlVerticalScope.all);

final catalogNavIntentProvider =
    StateProvider<CatalogNavIntent>((ref) => CatalogNavIntent.dishCategories);

/// Unique id of the last tapped sidebar entry (for highlight).
final controlNavEntryIdProvider = StateProvider<String?>((ref) => null);

bool isMarketplaceBusinessType(ControlBusinessType bt) {
  if (!bt.isActive) return false;
  if (bt.slug == 'restaurant') return false;
  if (bt.menuMode == 'GLOBAL_DISH') return false;
  return true;
}
