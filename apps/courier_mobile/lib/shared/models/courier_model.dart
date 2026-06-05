import '../../core/utils/json_parse.dart';

class CourierProfileModel {
  const CourierProfileModel({
    required this.id,
    required this.isOnline,
    this.currentLat,
    this.currentLng,
    this.totalDeliveries = 0,
    this.user,
  });

  final String id;
  final bool isOnline;
  final double? currentLat;
  final double? currentLng;
  final int totalDeliveries;
  final CourierUserModel? user;

  factory CourierProfileModel.fromJson(Map<String, dynamic> json) {
    final userJson = json['user'] as Map<String, dynamic>?;
    return CourierProfileModel(
      id: json['id'] as String,
      isOnline: json['isOnline'] as bool? ?? false,
      currentLat: parseDouble(json['currentLat']),
      currentLng: parseDouble(json['currentLng']),
      totalDeliveries: (json['totalDeliveries'] as num?)?.toInt() ?? 0,
      user: userJson == null ? null : CourierUserModel.fromJson(userJson),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'isOnline': isOnline,
        'currentLat': currentLat,
        'currentLng': currentLng,
        'totalDeliveries': totalDeliveries,
        'user': user?.toJson(),
      };
}

class CourierUserModel {
  const CourierUserModel({required this.fullName, this.phone});

  final String fullName;
  final String? phone;

  factory CourierUserModel.fromJson(Map<String, dynamic> json) {
    return CourierUserModel(
      fullName: json['fullName'] as String? ?? '',
      phone: json['phone'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {'fullName': fullName, 'phone': phone};
}
