import '../../../core/utils/json_parse.dart';
import '../../../shared/widgets/image_framing_controls.dart';

class ControlBanner {
  const ControlBanner({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.placement,
    required this.sortOrder,
    required this.isActive,
    this.description,
    this.linkUrl,
    this.businessId,
    this.imageScale,
    this.imagePositionX,
    this.imagePositionY,
    this.startsAt,
    this.endsAt,
    this.createdAt,
  });

  final String id;
  final String title;
  final String imageUrl;
  final String placement;
  final int sortOrder;
  final bool isActive;
  final String? description;
  final String? linkUrl;
  final String? businessId;
  final int? imageScale;
  final int? imagePositionX;
  final int? imagePositionY;
  final DateTime? startsAt;
  final DateTime? endsAt;
  final DateTime? createdAt;

  ImageFramingValues get framing => ImageFramingValues(
        imageScale: ImageFramingValues.clampScale(imageScale),
        imagePositionX: ImageFramingValues.clampPos(imagePositionX),
        imagePositionY: ImageFramingValues.clampPos(imagePositionY),
      );

  factory ControlBanner.fromJson(Map<String, dynamic> json) {
    return ControlBanner(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      placement: json['placement'] as String? ?? 'HERO',
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? false,
      description: json['description'] as String?,
      linkUrl: json['linkUrl'] as String?,
      businessId: json['businessId'] as String? ?? json['restaurantId'] as String?,
      imageScale: (json['imageScale'] as num?)?.toInt(),
      imagePositionX: (json['imagePositionX'] as num?)?.toInt(),
      imagePositionY: (json['imagePositionY'] as num?)?.toInt(),
      startsAt: parseDateTime(json['startsAt']),
      endsAt: parseDateTime(json['endsAt']),
      createdAt: parseDateTime(json['createdAt']),
    );
  }
}
