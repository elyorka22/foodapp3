import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/utils/json_parse.dart';
import 'dish_category_model.dart';
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

  Future<List<ControlDishCategory>> fetchDishCategoriesAdmin() async {
    final res = await _dio.get<dynamic>(ApiPaths.dishCategoriesAdmin);
    return parseObjectList(res.data)
        .map(ControlDishCategory.fromJson)
        .toList();
  }

  Future<ControlDishCategory> createDishCategory({
    required String name,
    String? description,
    String? imageUrl,
    int? imageScale,
    int? imagePositionX,
    int? imagePositionY,
    int? sortOrder,
    bool isActive = true,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.dishCategories,
      data: {
        'name': name,
        'isActive': isActive,
        if (description != null && description.isNotEmpty)
          'description': description,
        if (imageUrl != null && imageUrl.isNotEmpty) 'imageUrl': imageUrl,
        if (imageScale != null) 'imageScale': imageScale,
        if (imagePositionX != null) 'imagePositionX': imagePositionX,
        if (imagePositionY != null) 'imagePositionY': imagePositionY,
        if (sortOrder != null) 'sortOrder': sortOrder,
      },
    );
    return ControlDishCategory.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlDishCategory> updateDishCategory(
    String id, {
    String? name,
    String? description,
    String? imageUrl,
    int? imageScale,
    int? imagePositionX,
    int? imagePositionY,
    int? sortOrder,
    bool? isActive,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.dishCategory(id),
      data: {
        if (name != null) 'name': name,
        if (description != null) 'description': description,
        if (imageUrl != null) 'imageUrl': imageUrl,
        if (imageScale != null) 'imageScale': imageScale,
        if (imagePositionX != null) 'imagePositionX': imagePositionX,
        if (imagePositionY != null) 'imagePositionY': imagePositionY,
        if (sortOrder != null) 'sortOrder': sortOrder,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return ControlDishCategory.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteDishCategory(String id) async {
    await _dio.delete<dynamic>(ApiPaths.dishCategory(id));
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepository(ref.watch(dioProvider));
});
