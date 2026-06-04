/// Restaurant vs marketplace store (matches backend BusinessKind).
bool isRestaurantKind({String? kind, String? typeSlug}) {
  if (kind == 'RESTAURANT') return true;
  return typeSlug == 'restaurant';
}

bool isStoreKind({String? kind, String? typeSlug}) {
  if (kind == 'RESTAURANT') return false;
  if (kind == 'STORE') return true;
  return typeSlug != null && typeSlug != 'restaurant';
}

List<T> filterStoreBusinesses<T>(
  List<T> items, {
  required String? Function(T) kindOf,
  required String? Function(T) typeSlugOf,
}) {
  return items
      .where(
        (b) => isStoreKind(kind: kindOf(b), typeSlug: typeSlugOf(b)),
      )
      .toList();
}
