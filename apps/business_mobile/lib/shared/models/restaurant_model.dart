import 'working_hour_model.dart';

class RestaurantModel {
  const RestaurantModel({
    required this.id,
    required this.name,
    this.kind = 'RESTAURANT',
    this.phone,
    this.branchAddress,
    this.isActive = true,
    this.description,
    this.latitude,
    this.longitude,
    this.ownerLogin,
    this.ownerPassword,
    this.ownerFullName,
    this.workingHours,
  });

  final String id;
  final String name;
  final String kind;
  final String? phone;
  final String? branchAddress;
  final bool isActive;
  final String? description;
  final double? latitude;
  final double? longitude;
  final String? ownerLogin;
  final String? ownerPassword;
  final String? ownerFullName;
  final List<WorkingHourModel>? workingHours;

  bool get isStore => kind == 'STORE';

  factory RestaurantModel.fromJson(Map<String, dynamic> json) {
    final branch = json['branch'] as Map<String, dynamic>?;
    return RestaurantModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      kind: json['kind'] as String? ?? 'RESTAURANT',
      phone: json['phone'] as String?,
      branchAddress: branch?['address'] as String? ?? json['branchAddress'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      description: json['description'] as String?,
      latitude: _toDouble(branch?['latitude'] ?? json['latitude']),
      longitude: _toDouble(branch?['longitude'] ?? json['longitude']),
      ownerLogin: json['ownerLogin'] as String?,
      ownerFullName: json['ownerFullName'] as String?,
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        'kind': kind,
        if (phone != null && phone!.isNotEmpty) 'phone': phone,
        if (branchAddress != null && branchAddress!.isNotEmpty) 'branchAddress': branchAddress,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        'isActive': isActive,
        if (description != null && description!.isNotEmpty) 'description': description,
        if (ownerLogin != null && ownerLogin!.isNotEmpty) 'ownerLogin': ownerLogin,
        if (ownerPassword != null && ownerPassword!.isNotEmpty) 'ownerPassword': ownerPassword,
        if (ownerFullName != null && ownerFullName!.isNotEmpty) 'ownerFullName': ownerFullName,
        if (workingHours != null && workingHours!.isNotEmpty)
          'workingHours': workingHours!.map((h) => h.toJson()).toList(),
      };

  Map<String, dynamic> toUpdateJson() => {
        'name': name,
        if (phone != null) 'phone': phone,
        if (branchAddress != null) 'branchAddress': branchAddress,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        'isActive': isActive,
        if (description != null) 'description': description,
        if (ownerPassword != null && ownerPassword!.isNotEmpty) 'ownerPassword': ownerPassword,
        if (workingHours != null && workingHours!.isNotEmpty)
          'workingHours': workingHours!.map((h) => h.toJson()).toList(),
      };
}

double? _toDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}
