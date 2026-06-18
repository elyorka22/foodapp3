class CityModel {
  const CityModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.isDefault,
  });

  final String id;
  final String name;
  final String slug;
  final bool isDefault;

  factory CityModel.fromJson(Map<String, dynamic> json) {
    return CityModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }
}
