import '../../../core/utils/json_parse.dart';

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
  final DateTime? startsAt;
  final DateTime? endsAt;
  final DateTime? createdAt;

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
      businessId: json['businessId'] as String?,
      startsAt: parseDateTime(json['startsAt']),
      endsAt: parseDateTime(json['endsAt']),
      createdAt: parseDateTime(json['createdAt']),
    );
  }
}
