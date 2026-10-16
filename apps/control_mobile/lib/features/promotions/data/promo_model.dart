import '../../../core/utils/json_parse.dart';

class ControlPromoCode {
  const ControlPromoCode({
    required this.id,
    required this.code,
    required this.type,
    required this.value,
    required this.isActive,
    this.minimumOrderAmount,
    this.maximumDiscount,
    this.usageLimit,
    this.usageCount = 0,
    this.startsAt,
    this.expiresAt,
    this.createdAt,
  });

  final String id;
  final String code;
  final String type;
  final num value;
  final bool isActive;
  final num? minimumOrderAmount;
  final num? maximumDiscount;
  final int? usageLimit;
  final int usageCount;
  final DateTime? startsAt;
  final DateTime? expiresAt;
  final DateTime? createdAt;

  factory ControlPromoCode.fromJson(Map<String, dynamic> json) {
    return ControlPromoCode(
      id: json['id'] as String? ?? '',
      code: json['code'] as String? ?? '',
      type: json['type'] as String? ?? '',
      value: parseNum(json['value']),
      isActive: json['isActive'] as bool? ?? false,
      minimumOrderAmount: json['minimumOrderAmount'] != null
          ? parseNum(json['minimumOrderAmount'])
          : null,
      maximumDiscount: json['maximumDiscount'] != null
          ? parseNum(json['maximumDiscount'])
          : null,
      usageLimit: (json['usageLimit'] as num?)?.toInt(),
      usageCount: (json['usageCount'] as num?)?.toInt() ?? 0,
      startsAt: parseDateTime(json['startsAt']),
      expiresAt: parseDateTime(json['expiresAt']),
      createdAt: parseDateTime(json['createdAt']),
    );
  }
}
