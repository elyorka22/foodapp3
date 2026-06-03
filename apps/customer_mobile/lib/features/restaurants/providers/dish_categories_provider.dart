import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/dish_category_model.dart';
import '../data/dish_categories_repository.dart';

final dishCategoriesProvider = FutureProvider<List<DishCategoryModel>>((ref) {
  return ref.watch(dishCategoriesRepositoryProvider).fetchCategories();
});

final categoryProductsProvider = FutureProvider.family<List<CategoryProductModel>, String>((ref, slug) {
  return ref.watch(dishCategoriesRepositoryProvider).fetchProductsByCategory(slug);
});
