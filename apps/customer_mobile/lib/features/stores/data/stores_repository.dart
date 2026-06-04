import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/business_kind.dart';
import '../../../shared/models/business_model.dart';
import '../../../shared/models/paginated_response.dart';
import '../../../shared/models/restaurant_model.dart';

final storesRepositoryProvider = Provider<StoresRepository>((ref) {
  return StoresRepository(ref.watch(dioProvider));
});

class StoresRepository {
  StoresRepository(this._dio);

  final Dio _dio;

  Future<List<BusinessTypeModel>> fetchBusinessTypes() async {
    final res = await _dio.get<List<dynamic>>(ApiPaths.businessTypes);
    return (res.data ?? [])
        .whereType<Map>()
        .map((e) => BusinessTypeModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<List<BusinessModel>> fetchStores({
    String? search,
    String? typeSlug,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.businesses,
      queryParameters: {
        'limit': 50,
        'vertical': 'store',
        if (search != null && search.isNotEmpty) 'search': search,
        if (typeSlug != null) 'type': typeSlug,
      },
    );
    final list = PaginatedResponse.fromJson(
      res.data!,
      BusinessModel.fromJson,
    ).data;
    return filterStoreBusinesses(
      list,
      kindOf: (b) => b.kind,
      typeSlugOf: (b) => b.businessType?.slug,
    );
  }

  Future<BusinessModel> fetchStoreDetail(String idOrSlug) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.businessDetail(idOrSlug),
    );
    return BusinessModel.fromJson(res.data!);
  }

  Future<List<ProductModel>> fetchProducts(String businessId) async {
    final res = await _dio.get<List<dynamic>>(
      ApiPaths.productsByRestaurant(businessId),
    );
    return (res.data ?? [])
        .whereType<Map>()
        .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
}
