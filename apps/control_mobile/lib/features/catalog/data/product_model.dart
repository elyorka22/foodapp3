import '../../../core/utils/json_parse.dart';

class ControlProduct {
  const ControlProduct({
    required this.id,
    required this.name,
    required this.slug,
    required this.price,
    required this.isAvailable,
    this.description,
    this.comparePrice,
    this.imageUrl,
    this.businessId,
    this.businessName,
    this.categoryName,
    this.createdAt,
  });

  final String id;
  final String name;
  final String slug;
  final num price;
  final bool isAvailable;
  final String? description;
  final num? comparePrice;
  final String? imageUrl;
  final String? businessId;
  final String? businessName;
  final String? categoryName;
  final DateTime? createdAt;

  factory ControlProduct.fromJson(Map<String, dynamic> json) {
    final business = json['business'] as Map<String, dynamic>?;
    final category = json['category'] as Map<String, dynamic>?;
    final dishCategory = json['dishCategory'] as Map<String, dynamic>?;
    final productCategory = json['productCategory'] as Map<String, dynamic>?;
    final images = json['images'];
    String? firstImage;
    if (images is List && images.isNotEmpty) {
      final first = images.first;
      if (first is Map<String, dynamic>) {
        firstImage = first['url'] as String?;
      }
    }

    return ControlProduct(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      price: parseNum(json['price']),
      isAvailable: json['isAvailable'] as bool? ?? false,
      description: json['description'] as String?,
      comparePrice: json['comparePrice'] != null
          ? parseNum(json['comparePrice'])
          : null,
      imageUrl: firstImage ?? json['imageUrl'] as String?,
      businessId: business?['id'] as String?,
      businessName: business?['name'] as String?,
      categoryName: category?['name'] as String? ??
          dishCategory?['name'] as String? ??
          productCategory?['name'] as String?,
      createdAt: parseDateTime(json['createdAt']),
    );
  }
}
