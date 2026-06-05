import '../../core/utils/json_parse.dart';

class CourierOrderModel {
  const CourierOrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.subtotal,
    required this.deliveryFee,
    required this.total,
    this.distanceKm,
    this.restaurantName,
    this.customerName,
    this.customerPhone,
    this.customerAddress,
    this.customerLat,
    this.customerLng,
    this.restaurantLat,
    this.restaurantLng,
    this.courierFee,
    this.assignmentAcceptedAt,
  });

  final String id;
  final String orderNumber;
  final String status;
  final num subtotal;
  final num deliveryFee;
  final num total;
  final double? distanceKm;
  final String? restaurantName;
  final String? customerName;
  final String? customerPhone;
  final String? customerAddress;
  final double? customerLat;
  final double? customerLng;
  final double? restaurantLat;
  final double? restaurantLng;
  final num? courierFee;
  final DateTime? assignmentAcceptedAt;

  factory CourierOrderModel.fromJson(Map<String, dynamic> json) {
    final restaurant = json['restaurant'] as Map<String, dynamic>?;
    final business = json['business'] as Map<String, dynamic>?;
    final guest = json['guestOrder'] as Map<String, dynamic>?;
    final address = json['address'] as Map<String, dynamic>?;
    final assignment = json['assignment'] as Map<String, dynamic>?;
    final courier = json['courier'] as Map<String, dynamic>?;
    final courierUser = courier?['user'] as Map<String, dynamic>?;

    final customerLat = parseDouble(guest?['latitude']) ??
        parseDouble(address?['latitude']) ??
        parseDouble(json['customerLatitude']);
    final customerLng = parseDouble(guest?['longitude']) ??
        parseDouble(address?['longitude']) ??
        parseDouble(json['customerLongitude']);

    return CourierOrderModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String? ?? json['id'] as String,
      status: json['status'] as String? ?? 'PENDING',
      subtotal: json['subtotal'] as num? ?? 0,
      deliveryFee: json['deliveryFee'] as num? ?? 0,
      total: json['total'] as num? ?? 0,
      distanceKm: parseDouble(json['distanceKm']),
      restaurantName: restaurant?['name'] as String? ?? business?['name'] as String?,
      customerName: guest?['customerName'] as String? ?? courierUser?['fullName'] as String?,
      customerPhone: guest?['phone'] as String?,
      customerAddress: guest?['deliveryAddress'] as String? ?? address?['line1'] as String?,
      customerLat: customerLat,
      customerLng: customerLng,
      restaurantLat: parseDouble(json['restaurantLatitude']),
      restaurantLng: parseDouble(json['restaurantLongitude']),
      courierFee: assignment?['courierFee'] as num? ?? json['deliveryFee'] as num?,
      assignmentAcceptedAt: _parseDateTime(assignment?['acceptedAt']),
    );
  }

  /// Manager-assigned order awaiting courier confirmation.
  bool get needsCourierAcceptance =>
      status == 'COURIER_ASSIGNED' && assignmentAcceptedAt == null;

  bool get isActive =>
      status == 'ACCEPTED' ||
      status == 'PREPARING' ||
      status == 'COURIER_ASSIGNED' ||
      status == 'ARRIVED_AT_RESTAURANT' ||
      status == 'PICKED_UP' ||
      status == 'DELIVERING';
}

DateTime? _parseDateTime(dynamic value) {
  if (value == null) return null;
  if (value is String) return DateTime.tryParse(value);
  return null;
}
