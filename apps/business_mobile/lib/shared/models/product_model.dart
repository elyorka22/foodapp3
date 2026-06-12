class ProductModel {
  const ProductModel({
    this.id,
    required this.name,
    required this.price,
    this.isAvailable = true,
    this.description,
    this.businessId,
  });

  final String? id;
  final String name;
  final num price;
  final bool isAvailable;
  final String? description;
  final String? businessId;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      price: json['price'] as num? ?? 0,
      isAvailable: json['isAvailable'] as bool? ?? true,
      description: json['description'] as String?,
      businessId: json['businessId'] as String? ?? json['restaurantId'] as String?,
    );
  }

  Map<String, dynamic> toCreateJson(String businessId) {
    final slug = _slugify(name);
    return {
        'businessId': businessId,
        'name': name,
        'slug': slug.isEmpty ? 'item-${DateTime.now().millisecondsSinceEpoch}' : slug,
        'price': price,
        if (description != null && description!.isNotEmpty) 'description': description,
        'isAvailable': isAvailable,
      };
  }

  Map<String, dynamic> toUpdateJson() => {
        'name': name,
        'price': price,
        if (description != null) 'description': description,
        'isAvailable': isAvailable,
      };
}

String _slugify(String name) {
  return name
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
      .replaceAll(RegExp(r'^-|-$'), '');
}
