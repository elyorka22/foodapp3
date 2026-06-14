import '../../core/utils/json_parse.dart';

class ProductModel {
  const ProductModel({
    this.id,
    required this.name,
    required this.price,
    this.isAvailable = true,
    this.description,
    this.businessId,
    this.dishCategoryId,
    this.productCategoryId,
    this.imageUrl,
  });

  final String? id;
  final String name;
  final num price;
  final bool isAvailable;
  final String? description;
  final String? businessId;
  final String? dishCategoryId;
  final String? productCategoryId;
  final String? imageUrl;

  String? get categoryId => dishCategoryId ?? productCategoryId;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final images = json['images'];
    String? imageUrl;
    if (images is List && images.isNotEmpty) {
      final first = images.first;
      if (first is Map) {
        imageUrl = first['url'] as String?;
      }
    }
    final category = json['category'];
    String? dishCategoryId = json['dishCategoryId'] as String?;
    String? productCategoryId = json['productCategoryId'] as String?;
    if (category is Map) {
      final categoryId = category['id'] as String?;
      if (dishCategoryId == null && productCategoryId == null) {
        dishCategoryId = categoryId;
      }
    }

    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      price: parseNum(json['price']),
      isAvailable: json['isAvailable'] as bool? ?? true,
      description: json['description'] as String?,
      businessId: json['businessId'] as String? ?? json['restaurantId'] as String?,
      dishCategoryId: dishCategoryId,
      productCategoryId: productCategoryId,
      imageUrl: imageUrl,
    );
  }

  Map<String, dynamic> toCreateJson(String businessId, {required bool isStore}) {
    final slug = _slugify(name);
    final categoryId = dishCategoryId ?? productCategoryId;
    return {
      'businessId': businessId,
      'name': name,
      'slug': slug.isEmpty ? 'item-${DateTime.now().millisecondsSinceEpoch}' : slug,
      'price': price,
      if (description != null && description!.isNotEmpty) 'description': description,
      'isAvailable': isAvailable,
      if (isStore && categoryId != null) 'productCategoryId': categoryId,
      if (!isStore && categoryId != null) 'dishCategoryId': categoryId,
    };
  }

  Map<String, dynamic> toUpdateJson({required bool isStore}) {
    final categoryId = dishCategoryId ?? productCategoryId;
    return {
      'name': name,
      'slug': _slugify(name),
      'price': price,
      if (description != null) 'description': description,
      'isAvailable': isAvailable,
      if (isStore && categoryId != null) 'productCategoryId': categoryId,
      if (!isStore && categoryId != null) 'dishCategoryId': categoryId,
    };
  }
}

String _slugify(String name) {
  return name
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
      .replaceAll(RegExp(r'^-|-$'), '');
}
