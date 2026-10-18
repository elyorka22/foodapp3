import '../../../core/utils/json_parse.dart';

class ControlDeliveryZone {
  const ControlDeliveryZone({
    required this.id,
    required this.name,
    required this.baseFee,
    required this.pricePerKm,
    required this.minDeliveryFee,
    required this.isActive,
    this.cityId,
    this.cityName,
    this.centerLatitude,
    this.centerLongitude,
    this.radiusKm,
  });

  final String id;
  final String name;
  final num baseFee;
  final num pricePerKm;
  final num minDeliveryFee;
  final bool isActive;
  final String? cityId;
  final String? cityName;
  final double? centerLatitude;
  final double? centerLongitude;
  final double? radiusKm;

  factory ControlDeliveryZone.fromJson(Map<String, dynamic> json) {
    final city = json['city'] as Map<String, dynamic>?;
    return ControlDeliveryZone(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      baseFee: parseNum(json['baseFee']),
      pricePerKm: parseNum(json['pricePerKm']),
      minDeliveryFee: parseNum(json['minDeliveryFee']),
      isActive: json['isActive'] as bool? ?? true,
      cityId: json['cityId'] as String? ?? city?['id'] as String?,
      cityName: city?['name'] as String?,
      centerLatitude: parseDouble(json['centerLatitude']),
      centerLongitude: parseDouble(json['centerLongitude']),
      radiusKm: parseDouble(json['radiusKm']),
    );
  }
}
