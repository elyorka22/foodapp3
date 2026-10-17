import '../../../shared/widgets/image_framing_controls.dart';

class ControlDishCategory {
  const ControlDishCategory({
    required this.id,
    required this.name,
    required this.slug,
    required this.sortOrder,
    required this.isActive,
    this.description,
    this.imageUrl,
    this.imageScale,
    this.imagePositionX,
    this.imagePositionY,
  });

  final String id;
  final String name;
  final String slug;
  final int sortOrder;
  final bool isActive;
  final String? description;
  final String? imageUrl;
  final int? imageScale;
  final int? imagePositionX;
  final int? imagePositionY;

  ImageFramingValues get framing => ImageFramingValues(
        imageScale: ImageFramingValues.clampScale(imageScale),
        imagePositionX: ImageFramingValues.clampPos(imagePositionX),
        imagePositionY: ImageFramingValues.clampPos(imagePositionY),
      );

  factory ControlDishCategory.fromJson(Map<String, dynamic> json) {
    return ControlDishCategory(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? true,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      imageScale: (json['imageScale'] as num?)?.toInt(),
      imagePositionX: (json['imagePositionX'] as num?)?.toInt(),
      imagePositionY: (json['imagePositionY'] as num?)?.toInt(),
    );
  }
}
