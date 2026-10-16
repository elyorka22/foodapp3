import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import 'product_model.dart';

class CatalogRepository {
  CatalogRepository(this._dio);

  final Dio _dio;

  /// `GET /products/admin?page&limit`
  Future<PaginatedResponse<ControlProduct>> fetchProducts({
    int page = 1,
    int limit = 20,
    Map<String, dynamic>? query,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.productsAdmin,
      queryParameters: {
        'page': page,
        'limit': limit,
        ...?query,
      },
    );
    return PaginatedResponse.fromJson(
      res.data ?? <String, dynamic>{},
      ControlProduct.fromJson,
    );
  }

  Future<ControlProduct> updateProduct(
    String id, {
    bool? isAvailable,
    String? name,
    num? price,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.product(id),
      data: {
        if (isAvailable != null) 'isAvailable': isAvailable,
        if (name != null) 'name': name,
        if (price != null) 'price': price,
      },
    );
    return ControlProduct.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteProduct(String id) async {
    await _dio.delete<dynamic>(ApiPaths.product(id));
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepository(ref.watch(dioProvider));
});
