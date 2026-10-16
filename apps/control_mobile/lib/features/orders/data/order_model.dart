import '../../../core/utils/json_parse.dart';

/// Admin order row from `GET /orders` (serialized order payload).
class ControlOrder {
  const ControlOrder({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.total,
    this.subtotal = 0,
    this.deliveryFee = 0,
    this.customerPhone,
    this.businessName,
    this.courierName,
    this.courierId,
    this.cancelReason,
    this.createdAt,
  });

  final String id;
  final String orderNumber;
  final String status;
  final num total;
  final num subtotal;
  final num deliveryFee;
  final String? customerPhone;
  final String? businessName;
  final String? courierName;
  final String? courierId;
  final String? cancelReason;
  final DateTime? createdAt;

  static const statusOptions = <String>[
    'PENDING',
    'ACCEPTED',
    'PREPARING',
    'COURIER_ASSIGNED',
    'ARRIVED_AT_RESTAURANT',
    'PICKED_UP',
    'DELIVERING',
    'DELIVERED',
    'CANCELLED',
  ];

  factory ControlOrder.fromJson(Map<String, dynamic> json) {
    final guest = json['guestOrder'] as Map<String, dynamic>?;
    final restaurant = json['restaurant'] as Map<String, dynamic>?;
    final business = json['business'] as Map<String, dynamic>?;
    final courier = json['courier'] as Map<String, dynamic>?;
    final courierUser = courier?['user'] as Map<String, dynamic>?;

    return ControlOrder(
      id: json['id'] as String? ?? '',
      orderNumber: json['orderNumber'] as String? ?? '',
      status: json['status'] as String? ?? '',
      total: parseNum(json['total']),
      subtotal: parseNum(json['subtotal']),
      deliveryFee: parseNum(json['deliveryFee']),
      customerPhone: guest?['phone'] as String?,
      businessName:
          restaurant?['name'] as String? ?? business?['name'] as String?,
      courierName: courierUser?['fullName'] as String? ??
          courier?['fullName'] as String?,
      courierId: courier?['id'] as String? ?? json['courierId'] as String?,
      cancelReason: json['cancelReason'] as String?,
      createdAt: parseDateTime(json['createdAt']),
    );
  }
}
