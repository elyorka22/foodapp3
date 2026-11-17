import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/utils/json_parse.dart';
import 'dish_category_model.dart';
import 'product_category_model.dart';
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

  Future<ControlProduct> createProduct({
    required String businessId,
    required String name,
    required num price,
    required String dishCategoryId,
    String? description,
    bool isAvailable = true,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.products,
      data: {
        'businessId': businessId,
        'name': name,
        'price': price,
        'dishCategoryId': dishCategoryId,
        'isAvailable': isAvailable,
        if (description != null && description.isNotEmpty)
          'description': description,
      },
    );
    return ControlProduct.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlProduct> updateProduct(
    String id, {
    bool? isAvailable,
    String? name,
    num? price,
    String? description,
    String? dishCategoryId,
    String? businessId,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.product(id),
      data: {
        if (isAvailable != null) 'isAvailable': isAvailable,
        if (name != null) 'name': name,
        if (price != null) 'price': price,
        if (description != null) 'description': description,
        if (dishCategoryId != null) 'dishCategoryId': dishCategoryId,
        if (businessId != null) 'businessId': businessId,
      },
    );
    return ControlProduct.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> addProductImage(String id, {required String url}) async {
    await _dio.post<dynamic>(
      ApiPaths.productImage(id),
      data: {'url': url},
    );
  }

  Future<void> deleteProduct(String id) async {
    await _dio.delete<dynamic>(ApiPaths.product(id));
  }

  /// Shared catalog products for a business type (`GET /products/shared`).
  Future<PaginatedResponse<ControlProduct>> fetchSharedProducts({
    String? typeSlug,
    String? businessTypeId,
    int page = 1,
    int limit = 100,
    String? search,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.productsShared,
      queryParameters: {
        'page': page,
        'limit': limit,
        if (typeSlug != null && typeSlug.isNotEmpty) 'type': typeSlug,
        if (businessTypeId != null && businessTypeId.isNotEmpty)
          'businessTypeId': businessTypeId,
        if (search != null && search.isNotEmpty) 'search': search,
      },
    );
    return PaginatedResponse.fromJson(
      res.data ?? <String, dynamic>{},
      ControlProduct.fromJson,
    );
  }

  Future<ControlProduct> createSharedProduct({
    String? typeSlug,
    String? businessTypeId,
    String? productCategoryId,
    required String name,
    String? description,
    num? defaultPrice,
    num? price,
    bool isAvailable = true,
    int? sortOrder,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.productsShared,
      data: {
        if (typeSlug != null && typeSlug.isNotEmpty) 'type': typeSlug,
        if (businessTypeId != null && businessTypeId.isNotEmpty)
          'businessTypeId': businessTypeId,
        if (productCategoryId != null && productCategoryId.isNotEmpty)
          'productCategoryId': productCategoryId,
        'name': name,
        if (description != null && description.isNotEmpty)
          'description': description,
        if (defaultPrice != null) 'defaultPrice': defaultPrice,
        if (price != null) 'price': price,
        'isAvailable': isAvailable,
        if (sortOrder != null) 'sortOrder': sortOrder,
      },
    );
    return ControlProduct.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlProduct> updateSharedProduct(
    String id, {
    String? name,
    String? description,
    String? productCategoryId,
    num? defaultPrice,
    num? price,
    bool? isAvailable,
    int? sortOrder,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.productShared(id),
      data: {
        if (name != null) 'name': name,
        if (description != null) 'description': description,
        if (productCategoryId != null) 'productCategoryId': productCategoryId,
        if (defaultPrice != null) 'defaultPrice': defaultPrice,
        if (price != null) 'price': price,
        if (isAvailable != null) 'isAvailable': isAvailable,
        if (sortOrder != null) 'sortOrder': sortOrder,
      },
    );
    return ControlProduct.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteSharedProduct(String id) async {
    await _dio.delete<dynamic>(ApiPaths.productShared(id));
  }

  Future<Map<String, dynamic>> enrollCatalog({
    required String businessId,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.productsEnrollCatalog,
      data: {'businessId': businessId},
    );
    return res.data ?? <String, dynamic>{};
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

  /// Shared catalog: `GET /categories?type=` or `?businessTypeId=` (legacy: businessId).
  Future<List<ControlProductCategory>> fetchProductCategories({
    String? businessTypeId,
    String? typeSlug,
    String? businessId,
  }) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.productCategories,
      queryParameters: {
        if (businessTypeId != null && businessTypeId.isNotEmpty)
          'businessTypeId': businessTypeId,
        if (typeSlug != null && typeSlug.isNotEmpty) 'type': typeSlug,
        if (businessId != null && businessId.isNotEmpty)
          'businessId': businessId,
        'includeInactive': 'true',
      },
    );
    return parseObjectList(res.data)
        .map(ControlProductCategory.fromJson)
        .toList();
  }

  Future<ControlProductCategory> createProductCategory({
    String? businessTypeId,
    String? typeSlug,
    required String name,
    required String slug,
    String? imageUrl,
    int? imageScale,
    int? imagePositionX,
    int? imagePositionY,
    int? sortOrder,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.productCategories,
      data: {
        if (businessTypeId != null && businessTypeId.isNotEmpty)
          'businessTypeId': businessTypeId,
        if (typeSlug != null && typeSlug.isNotEmpty) 'type': typeSlug,
        'name': name,
        'slug': slug,
        if (imageUrl != null && imageUrl.isNotEmpty) 'imageUrl': imageUrl,
        if (imageScale != null) 'imageScale': imageScale,
        if (imagePositionX != null) 'imagePositionX': imagePositionX,
        if (imagePositionY != null) 'imagePositionY': imagePositionY,
        if (sortOrder != null) 'sortOrder': sortOrder,
      },
    );
    return ControlProductCategory.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlProductCategory> updateProductCategory(
    String id, {
    String? name,
    String? slug,
    String? imageUrl,
    int? imageScale,
    int? imagePositionX,
    int? imagePositionY,
    int? sortOrder,
    bool? isActive,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.productCategory(id),
      data: {
        if (name != null) 'name': name,
        if (slug != null) 'slug': slug,
        if (imageUrl != null) 'imageUrl': imageUrl,
        if (imageScale != null) 'imageScale': imageScale,
        if (imagePositionX != null) 'imagePositionX': imagePositionX,
        if (imagePositionY != null) 'imagePositionY': imagePositionY,
        if (sortOrder != null) 'sortOrder': sortOrder,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return ControlProductCategory.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteProductCategory(String id) async {
    await _dio.delete<dynamic>(ApiPaths.productCategory(id));
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepository(ref.watch(dioProvider));
});
