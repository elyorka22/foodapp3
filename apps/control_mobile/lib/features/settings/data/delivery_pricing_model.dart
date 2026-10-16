import '../../../core/utils/json_parse.dart';

class DeliveryPricing {
  const DeliveryPricing({
    this.baseDeliveryFee = 0,
    this.perKmFee = 0,
    this.maxDeliveryDistance = 0,
    this.courierPricePerKm = 0,
    this.courierMinFee = 0,
  });

  final num baseDeliveryFee;
  final num perKmFee;
  final num maxDeliveryDistance;
  final num courierPricePerKm;
  final num courierMinFee;

  factory DeliveryPricing.fromJson(Map<String, dynamic> json) {
    return DeliveryPricing(
      baseDeliveryFee: parseNum(json['baseDeliveryFee']),
      perKmFee: parseNum(json['perKmFee']),
      maxDeliveryDistance: parseNum(json['maxDeliveryDistance']),
      courierPricePerKm: parseNum(json['courierPricePerKm']),
      courierMinFee: parseNum(json['courierMinFee']),
    );
  }

  Map<String, dynamic> toJson() => {
        'baseDeliveryFee': baseDeliveryFee,
        'perKmFee': perKmFee,
        'maxDeliveryDistance': maxDeliveryDistance,
        'courierPricePerKm': courierPricePerKm,
        'courierMinFee': courierMinFee,
      };
}
