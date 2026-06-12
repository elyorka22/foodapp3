import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/category_model.dart';

final categoriesRepositoryProvider = Provider<CategoriesRepository>((ref) {
  return CategoriesRepository(ref.watch(dioProvider));
});

class CategoriesRepository {
  CategoriesRepository(this._dio);

  final Dio _dio;

  /// Dish categories for restaurants, store categories when [businessId] is a shop.
  Future<List<CategoryModel>> fetchForBusiness(String businessId) async {
    final res = await _dio.get<List<dynamic>>(
      ApiPaths.categories,
      queryParameters: {'businessId': businessId},
    );
    return (res.data ?? [])
        .whereType<Map<String, dynamic>>()
        .map(CategoryModel.fromJson)
        .toList();
  }
}
