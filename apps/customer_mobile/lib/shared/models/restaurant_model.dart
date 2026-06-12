import '../../core/utils/json_parse.dart';

class RestaurantCategoryModel {
  const RestaurantCategoryModel({
    required this.id,
    required this.name,
    required this.slug,
  });

  final String id;
  final String name;
  final String slug;

  factory RestaurantCategoryModel.fromJson(Map<String, dynamic> json) {
    return RestaurantCategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
    );
  }
}

class RestaurantModel {
  const RestaurantModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.logoUrl,
    this.coverUrl,
    this.coverPositionX,
    this.coverPositionY,
    this.coverScale,
    this.minOrderAmount,
    this.avgPrepMinutes,
    this.deliveryMinutes,
    this.averageRating,
    this.reviewCount,
    this.isOpen,
    this.closesAt,
    this.closingSoon,
    this.minutesUntilClose,
    this.catalogMode,
    this.kind,
    this.phone,
    this.address,
    this.categories,
    this.products,
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? logoUrl;
  final String? coverUrl;
  final int? coverPositionX;
  final int? coverPositionY;
  final int? coverScale;
  final num? minOrderAmount;
  final int? avgPrepMinutes;
  final int? deliveryMinutes;
  final double? averageRating;
  final int? reviewCount;
  final bool? isOpen;
  final String? closesAt;
  final bool? closingSoon;
  final int? minutesUntilClose;
  final String? catalogMode;
  final String? kind;
  final String? phone;
  final String? address;
  final List<RestaurantCategoryModel>? categories;
  final List<ProductModel>? products;

  factory RestaurantModel.fromJson(Map<String, dynamic> json) {
    final cats = json['productCategories'] ?? json['categories'];
    final prods = json['products'];
    return RestaurantModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      coverPositionX: parseIntOrNull(json['coverPositionX']),
      coverPositionY: parseIntOrNull(json['coverPositionY']),
      coverScale: parseIntOrNull(json['coverScale']),
      minOrderAmount: parseNumOrNull(json['minOrderAmount']),
      avgPrepMinutes: parseIntOrNull(json['avgPrepMinutes']),
      deliveryMinutes: parseIntOrNull(json['deliveryMinutes']) ??
          parseIntOrNull(json['avgPrepMinutes']),
      averageRating: parseDoubleOrNull(json['averageRating']),
      reviewCount: parseIntOrNull(json['reviewCount']),
      isOpen: json['isOpen'] as bool?,
      closesAt: json['closesAt'] as String?,
      closingSoon: json['closingSoon'] as bool?,
      minutesUntilClose: parseIntOrNull(json['minutesUntilClose']),
      catalogMode: json['catalogMode'] as String? ?? 'CATALOG',
      kind: json['kind'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      categories: cats is List
          ? cats
              .whereType<Map>()
              .map((e) => RestaurantCategoryModel.fromJson(
                    Map<String, dynamic>.from(e),
                  ))
              .toList()
          : null,
      products: prods is List
          ? prods
              .whereType<Map>()
              .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : null,
    );
  }
}

class ProductModel {
  const ProductModel({
    required this.id,
    required this.name,
    required this.price,
    this.comparePrice,
    this.description,
    this.imageUrl,
    this.categoryId,
    this.isAvailable,
  });

  final String id;
  final String name;
  final num price;
  final num? comparePrice;
  final String? description;
  final String? imageUrl;
  final String? categoryId;
  final bool? isAvailable;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final images = json['images'];
    String? imageUrl = parseString(json['imageUrl']);
    if (imageUrl == null && images is List && images.isNotEmpty) {
      final first = images.first;
      if (first is Map) {
        imageUrl = parseString(first['url']);
      }
    }
    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String,
      price: parseNum(json['price']),
      comparePrice: json['comparePrice'] != null ? parseNum(json['comparePrice']) : null,
      description: parseString(json['description']),
      imageUrl: imageUrl,
      categoryId: parseString(json['dishCategoryId'] ?? json['productCategoryId'] ?? json['categoryId']),
      isAvailable: parseBool(json['isAvailable']),
    );
  }
}

class ProductCategoryModel {
  const ProductCategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.sortOrder,
  });

  final String id;
  final String name;
  final String slug;
  final int? sortOrder;

  factory ProductCategoryModel.fromJson(Map<String, dynamic> json) {
    return ProductCategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      sortOrder: parseIntOrNull(json['sortOrder']),
    );
  }
}
