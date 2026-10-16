/// Restaurant vs marketplace store — prefer menuMode when present.
bool isRestaurantKind({String? kind, String? typeSlug, String? menuMode}) {
  if (menuMode == 'GLOBAL_DISH') return true;
  if (menuMode == 'OWN_CATEGORIES') return false;
  if (kind == 'RESTAURANT') return true;
  return typeSlug == 'restaurant';
}

bool isStoreKind({String? kind, String? typeSlug, String? menuMode}) {
  return !isRestaurantKind(kind: kind, typeSlug: typeSlug, menuMode: menuMode);
}

List<T> filterStoreBusinesses<T>(
  List<T> items, {
  required String? Function(T) kindOf,
  required String? Function(T) typeSlugOf,
  String? Function(T)? menuModeOf,
}) {
  return items
      .where(
        (b) => isStoreKind(
          kind: kindOf(b),
          typeSlug: typeSlugOf(b),
          menuMode: menuModeOf?.call(b),
        ),
      )
      .toList();
}
