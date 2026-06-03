import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/business_model.dart';
import '../data/stores_repository.dart';

class StoresQuery {
  const StoresQuery({this.search, this.typeSlug});
  final String? search;
  final String? typeSlug;

  @override
  bool operator ==(Object other) =>
      other is StoresQuery && other.search == search && other.typeSlug == typeSlug;

  @override
  int get hashCode => Object.hash(search, typeSlug);
}

final businessTypesProvider =
    FutureProvider.autoDispose<List<BusinessTypeModel>>((ref) {
  return ref.watch(storesRepositoryProvider).fetchBusinessTypes();
});

final storesListProvider =
    FutureProvider.autoDispose.family<List<BusinessModel>, StoresQuery>(
  (ref, query) {
    return ref.watch(storesRepositoryProvider).fetchStores(
          search: query.search,
          typeSlug: query.typeSlug,
        );
  },
);

final storeDetailProvider =
    FutureProvider.autoDispose.family<BusinessModel, String>((ref, slug) {
  return ref.watch(storesRepositoryProvider).fetchStoreDetail(slug);
});
