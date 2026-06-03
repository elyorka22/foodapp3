class BannerModel {
  const BannerModel({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.description,
    this.linkUrl,
    this.placement,
    this.restaurantId,
    this.sortOrder,
  });

  final String id;
  final String title;
  final String imageUrl;
  final String? description;
  final String? linkUrl;
  final String? placement;
  final String? restaurantId;
  final int? sortOrder;

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] as String,
      title: json['title'] as String,
      imageUrl: json['imageUrl'] as String,
      description: json['description'] as String?,
      linkUrl: json['linkUrl'] as String?,
      placement: json['placement'] as String?,
      restaurantId: json['restaurantId'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toInt(),
    );
  }
}
