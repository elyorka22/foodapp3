import '../../core/utils/json_parse.dart';
import '../../core/utils/image_url.dart';

class DishCategoryModel {
  const DishCategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.imageUrl,
    this.imageScale,
    this.imagePositionX,
    this.imagePositionY,
    this.productCount,
  });

  final String id;
  final String name;
  final String slug;
  final String? imageUrl;
  final int? imageScale;
  final int? imagePositionX;
  final int? imagePositionY;
  final int? productCount;

  String? get resolvedImageUrl => resolveImageUrl(imageUrl);

  factory DishCategoryModel.fromJson(Map<String, dynamic> json) {
    final count = json['_count'];
    return DishCategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      imageUrl: parseString(json['imageUrl']),
      imageScale: (json['imageScale'] as num?)?.toInt(),
      imagePositionX: (json['imagePositionX'] as num?)?.toInt(),
      imagePositionY: (json['imagePositionY'] as num?)?.toInt(),
      productCount: count is Map ? (count['products'] as num?)?.toInt() : null,
    );
  }
}

class CategoryProductModel {
  const CategoryProductModel({
    required this.id,
    required this.name,
    required this.price,
    this.description,
    this.imageUrl,
    this.restaurantName,
    this.restaurantSlug,
  });

  final String id;
  final String name;
  final num price;
  final String? description;
  final String? imageUrl;
  final String? restaurantName;
  final String? restaurantSlug;

  factory CategoryProductModel.fromJson(Map<String, dynamic> json) {
    final images = json['images'];
    String? imageUrl;
    if (images is List && images.isNotEmpty) {
      final first = images.first;
      if (first is Map) imageUrl = parseString(first['url']);
    }
    final business = json['business'];
    return CategoryProductModel(
      id: json['id'] as String,
      name: json['name'] as String,
      price: parseNum(json['price']),
      description: parseString(json['description']),
      imageUrl: imageUrl != null ? resolveImageUrl(imageUrl) : null,
      restaurantName: business is Map ? parseString(business['name']) : null,
      restaurantSlug: business is Map ? parseString(business['slug']) : null,
    );
  }
}
