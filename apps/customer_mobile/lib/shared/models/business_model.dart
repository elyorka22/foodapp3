import '../../core/utils/json_parse.dart';
import 'restaurant_model.dart';

class BusinessTypeModel {
  const BusinessTypeModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.icon,
    this.imageUrl,
    this.catalogMode,
    this.sortOrder,
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? icon;
  final String? imageUrl;
  final String? catalogMode;
  final int? sortOrder;

  factory BusinessTypeModel.fromJson(Map<String, dynamic> json) {
    return BusinessTypeModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      icon: json['icon'] as String?,
      imageUrl: json['imageUrl'] as String?,
      catalogMode: json['catalogMode'] as String?,
      sortOrder: parseIntOrNull(json['sortOrder']),
    );
  }
}

class BusinessModel {
  const BusinessModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.logoUrl,
    this.coverUrl,
    this.phone,
    this.minOrderAmount,
    this.deliveryMinutes,
    this.averageRating,
    this.reviewCount,
    this.businessType,
    this.category,
    this.products,
    this.productCategories,
    this.catalogMode,
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? logoUrl;
  final String? coverUrl;
  final String? phone;
  final num? minOrderAmount;
  final int? deliveryMinutes;
  final num? averageRating;
  final int? reviewCount;
  final BusinessTypeModel? businessType;
  final String? category;
  final List<ProductModel>? products;
  final List<ProductCategoryModel>? productCategories;
  final String? catalogMode;

  factory BusinessModel.fromJson(Map<String, dynamic> json) {
    final bt = json['businessType'];
    final prods = json['products'];
    final cats = json['productCategories'];
    return BusinessModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      phone: json['phone'] as String?,
      minOrderAmount: parseNumOrNull(json['minOrderAmount']),
      deliveryMinutes: parseIntOrNull(json['deliveryMinutes']),
      averageRating: parseNumOrNull(json['averageRating']),
      reviewCount: parseIntOrNull(json['reviewCount']),
      businessType: bt is Map
          ? BusinessTypeModel.fromJson(Map<String, dynamic>.from(bt))
          : null,
      category: json['category'] as String?,
      catalogMode: json['catalogMode'] as String?,
      products: prods is List
          ? prods
              .whereType<Map>()
              .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : null,
      productCategories: cats is List
          ? cats
              .whereType<Map>()
              .map((e) => ProductCategoryModel.fromJson(
                    Map<String, dynamic>.from(e),
                  ))
              .toList()
          : null,
    );
  }
}
