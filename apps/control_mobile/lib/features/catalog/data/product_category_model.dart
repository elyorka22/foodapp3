class ControlProductCategory {
  const ControlProductCategory({
    required this.id,
    required this.name,
    required this.slug,
    required this.sortOrder,
    required this.isActive,
    this.businessId,
    this.description,
    this.imageUrl,
    this.imageScale = 100,
    this.imagePositionX = 50,
    this.imagePositionY = 50,
  });

  final String id;
  final String name;
  final String slug;
  final int sortOrder;
  final bool isActive;
  final String? businessId;
  final String? description;
  final String? imageUrl;
  final int imageScale;
  final int imagePositionX;
  final int imagePositionY;

  factory ControlProductCategory.fromJson(Map<String, dynamic> json) {
    return ControlProductCategory(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? true,
      businessId: json['businessId'] as String? ??
          json['restaurantId'] as String?,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      imageScale: (json['imageScale'] as num?)?.toInt() ?? 100,
      imagePositionX: (json['imagePositionX'] as num?)?.toInt() ?? 50,
      imagePositionY: (json['imagePositionY'] as num?)?.toInt() ?? 50,
    );
  }
}
