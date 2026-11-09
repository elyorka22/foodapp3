import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../business_types/data/business_types_repository.dart';

/// Marketplace vertical currently applied to list screens in the shell.
class ControlVerticalScope {
  const ControlVerticalScope({
    this.id,
    this.slug,
    this.name,
    this.isRestaurant = false,
  });

  /// Business type id (for client-side filtering).
  final String? id;

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
      id: type.id,
      slug: type.slug ?? type.id,
      name: type.name,
      isRestaurant: false,
    );
  }

  bool get isScoped =>
      isRestaurant ||
      (id != null && id!.trim().isNotEmpty) ||
      (slug != null && slug!.trim().isNotEmpty);

  /// Only send params the live API already accepts (`vertical`).
  /// Slug filters (`type` / `businessType`) need a backend deploy; until then
  /// screens filter by [id] on the client.
  Map<String, dynamic> restaurantQuery() {
    if (!isScoped) return {};
    if (isRestaurant) return {'vertical': 'restaurant'};
    return {'vertical': 'store'};
  }

  Map<String, dynamic> ordersQuery() {
    if (!isScoped) return {};
    if (isRestaurant) return {'vertical': 'restaurant'};
    return {'vertical': 'store'};
  }

  Map<String, dynamic> storeListQuery() {
    if (!isScoped || isRestaurant) return {'vertical': 'store'};
    return {'vertical': 'store'};
  }

  bool matchesBusinessType({
    String? businessTypeId,
    String? businessTypeSlug,
    String? businessTypeName,
  }) {
    if (!isScoped || isRestaurant) return true;
    if (id != null &&
        id!.isNotEmpty &&
        businessTypeId != null &&
        businessTypeId == id) {
      return true;
    }
    if (slug != null &&
        slug!.isNotEmpty &&
        businessTypeSlug != null &&
        businessTypeSlug == slug) {
      return true;
    }
    if (name != null &&
        name!.isNotEmpty &&
        businessTypeName != null &&
        businessTypeName == name) {
      return true;
    }
    return false;
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
