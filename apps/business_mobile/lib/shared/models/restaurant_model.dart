class RestaurantModel {
  const RestaurantModel({
    required this.id,
    required this.name,
    this.phone,
    this.branchAddress,
    this.isActive = true,
    this.description,
    this.latitude,
    this.longitude,
  });

  final String id;
  final String name;
  final String? phone;
  final String? branchAddress;
  final bool isActive;
  final String? description;
  final double? latitude;
  final double? longitude;

  factory RestaurantModel.fromJson(Map<String, dynamic> json) {
    final branch = json['branch'] as Map<String, dynamic>?;
    return RestaurantModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String?,
      branchAddress: branch?['address'] as String? ?? json['branchAddress'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      description: json['description'] as String?,
      latitude: _toDouble(branch?['latitude'] ?? json['latitude']),
      longitude: _toDouble(branch?['longitude'] ?? json['longitude']),
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        if (phone != null && phone!.isNotEmpty) 'phone': phone,
        if (branchAddress != null && branchAddress!.isNotEmpty) 'branchAddress': branchAddress,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        'isActive': isActive,
        if (description != null && description!.isNotEmpty) 'description': description,
      };

  Map<String, dynamic> toUpdateJson() => {
        'name': name,
        if (phone != null) 'phone': phone,
        if (branchAddress != null) 'branchAddress': branchAddress,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        'isActive': isActive,
        if (description != null) 'description': description,
      };
}

double? _toDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}
