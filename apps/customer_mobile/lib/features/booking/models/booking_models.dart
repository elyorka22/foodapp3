class BookingVenueModel {
  const BookingVenueModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.address,
    this.phone,
    this.coverUrl,
    this.logoUrl,
    this.coverScale,
    this.coverPositionX,
    this.coverPositionY,
    required this.venueType,
    this.highlights = const [],
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? address;
  final String? phone;
  final String? coverUrl;
  final String? logoUrl;
  final int? coverScale;
  final int? coverPositionX;
  final int? coverPositionY;
  final String venueType;
  final List<String> highlights;

  factory BookingVenueModel.fromJson(Map<String, dynamic> json) {
    final highlights = json['highlights'];
    return BookingVenueModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      coverUrl: json['coverUrl'] as String?,
      logoUrl: json['logoUrl'] as String?,
      coverScale: json['coverScale'] as int?,
      coverPositionX: json['coverPositionX'] as int?,
      coverPositionY: json['coverPositionY'] as int?,
      venueType: json['venueType'] as String? ?? 'BOTH',
      highlights: highlights is List ? highlights.whereType<String>().toList() : const [],
    );
  }
}

class BookingSlideModel {
  const BookingSlideModel({
    required this.id,
    required this.title,
    this.subtitle,
    required this.imageUrl,
    this.imageScale,
    this.imagePositionX,
    this.imagePositionY,
    this.venueSlug,
  });

  final String id;
  final String title;
  final String? subtitle;
  final String imageUrl;
  final int? imageScale;
  final int? imagePositionX;
  final int? imagePositionY;
  final String? venueSlug;

  factory BookingSlideModel.fromJson(Map<String, dynamic> json) {
    final venue = json['venue'];
    return BookingSlideModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String?,
      imageUrl: json['imageUrl'] as String,
      imageScale: json['imageScale'] as int?,
      imagePositionX: json['imagePositionX'] as int?,
      imagePositionY: json['imagePositionY'] as int?,
      venueSlug: venue is Map ? venue['slug'] as String? : null,
    );
  }
}
