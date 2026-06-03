import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/dish_category_model.dart';
import '../../../shared/models/paginated_response.dart';

final dishCategoriesRepositoryProvider = Provider<DishCategoriesRepository>((ref) {
  return DishCategoriesRepository(ref.watch(dioProvider));
});

class DishCategoriesRepository {
  DishCategoriesRepository(this._dio);

  final Dio _dio;

  Future<List<DishCategoryModel>> fetchCategories() async {
    final res = await _dio.get<List<dynamic>>(ApiPaths.dishCategories);
    return (res.data ?? [])
        .whereType<Map>()
        .map((e) => DishCategoryModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<List<CategoryProductModel>> fetchProductsByCategory(String slug, {int page = 1}) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.products,
      queryParameters: {
        'categorySlug': slug,
        'page': page,
        'limit': 24,
      },
    );
    return PaginatedResponse.fromJson(
      res.data!,
      CategoryProductModel.fromJson,
    ).data;
  }
}
