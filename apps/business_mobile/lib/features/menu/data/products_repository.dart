import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import '../../../shared/models/product_model.dart';

final productsRepositoryProvider = Provider<ProductsRepository>((ref) {
  return ProductsRepository(ref.watch(dioProvider));
});

class ProductsRepository {
  ProductsRepository(this._dio);

  final Dio _dio;

  Future<List<ProductModel>> fetchProducts({String? businessId}) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.productsAdmin,
      queryParameters: {
        'limit': 100,
        if (businessId != null) 'businessId': businessId,
      },
    );
    return parseListResponse(res.data).map(ProductModel.fromJson).toList();
  }

  Future<ProductModel> createProduct(ProductModel product, String businessId) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.products,
      data: product.toCreateJson(businessId),
    );
    return ProductModel.fromJson(res.data!);
  }

  Future<ProductModel> updateProduct(ProductModel product) async {
    final id = product.id;
    if (id == null || id.isEmpty) {
      throw ArgumentError('Product id is required for update');
    }
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.product(id),
      data: product.toUpdateJson(),
    );
    return ProductModel.fromJson(res.data!);
  }

  Future<void> deleteProduct(String id) async {
    await _dio.delete(ApiPaths.product(id));
  }
}
