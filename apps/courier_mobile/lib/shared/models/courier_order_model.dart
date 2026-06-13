import '../../core/jobs/job_service_type.dart';
import '../../core/utils/json_parse.dart';

class CourierOrderLineItem {
  const CourierOrderLineItem({
    required this.name,
    required this.quantity,
    required this.price,
    required this.subtotal,
  });

  final String name;
  final int quantity;
  final num price;
  final num subtotal;

  factory CourierOrderLineItem.fromJson(Map<String, dynamic> json) {
    return CourierOrderLineItem(
      name: json['name'] as String? ?? '—',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      price: json['price'] as num? ?? 0,
      subtotal: json['subtotal'] as num? ?? 0,
    );
  }
}

class CourierOrderModel {
  const CourierOrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.subtotal,
    required this.deliveryFee,
    required this.discountAmount,
    required this.total,
    this.distanceKm,
    this.restaurantName,
    this.businessTypeSlug,
    this.customerName,
    this.customerPhone,
    this.customerAddress,
    this.customerLat,
    this.customerLng,
    this.restaurantLat,
    this.restaurantLng,
    this.courierFee,
    this.estimatedCourierFee,
    this.assignmentAcceptedAt,
    this.createdAt,
    this.items = const [],
  });

  final String id;
  final String orderNumber;
  final String status;
  final num subtotal;
  final num deliveryFee;
  final num discountAmount;
  final num total;
  final double? distanceKm;
  final String? restaurantName;
  final String? businessTypeSlug;

  String get merchantTypeLabel {
    if (businessTypeSlug == 'restaurant') return 'Restoran';
    if (businessTypeSlug != null && businessTypeSlug!.isNotEmpty) return 'Do\'kon';
    return '';
  }
  final String? customerName;
  final String? customerPhone;
  final String? customerAddress;
  final double? customerLat;
  final double? customerLng;
  final double? restaurantLat;
  final double? restaurantLng;
  final num? courierFee;
  final num? estimatedCourierFee;
  final DateTime? assignmentAcceptedAt;
  final DateTime? createdAt;
  final List<CourierOrderLineItem> items;

  /// Amount shown before accept: estimated courier payout from API or DB delivery fee.
  num get initialDeliveryFee =>
      estimatedCourierFee ?? courierFee ?? deliveryFee;

  /// Courier keeps this as delivery earnings (may differ from customer deliveryFee).
  num get courierEarnings => initialDeliveryFee;

  /// What the customer pays for delivery (part of order total).
  num get customerDeliveryFee => deliveryFee;

  /// Net food amount the courier pays at the merchant (after promo).
  num get orderAmount {
    if (total > 0) {
      final netFood = total - deliveryFee;
      return netFood > 0 ? netFood : 0;
    }
    final netFood = subtotal - discountAmount;
    return netFood > 0 ? netFood : 0;
  }

  /// Full amount to collect from the customer (food + delivery).
  num get collectFromCustomer {
    if (total > 0) return total;
    return orderAmount + deliveryFee;
  }

  bool get isCancelled => status == 'CANCELLED';

  bool get isDelivered => status == 'DELIVERED';

  /// Order in the courier inbox: pool (auto) or manager assignment awaiting accept.
  bool get isAvailableInPool =>
      !isCancelled &&
      !isDelivered &&
      (status == 'PREPARING' || needsCourierAcceptance);

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

    final rawItems = json['items'] as List<dynamic>? ?? [];
    final items = rawItems
        .map((e) => CourierOrderLineItem.fromJson(e as Map<String, dynamic>))
        .toList();

    return CourierOrderModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String? ?? json['id'] as String,
      status: json['status'] as String? ?? 'PENDING',
      subtotal: json['subtotal'] as num? ?? 0,
      deliveryFee: json['deliveryFee'] as num? ?? 0,
      discountAmount: json['discountAmount'] as num? ?? 0,
      total: json['total'] as num? ?? 0,
      distanceKm: parseDouble(json['distanceKm']),
      restaurantName: restaurant?['name'] as String? ?? business?['name'] as String?,
      businessTypeSlug: _readBusinessTypeSlug(restaurant) ??
          _readBusinessTypeSlug(business),
      customerName: guest?['customerName'] as String? ?? courierUser?['fullName'] as String?,
      customerPhone: guest?['phone'] as String?,
      customerAddress: guest?['deliveryAddress'] as String? ?? address?['line1'] as String?,
      customerLat: customerLat,
      customerLng: customerLng,
      restaurantLat: parseDouble(json['restaurantLatitude']) ??
          parseDouble(restaurant?['latitude']) ??
          parseDouble(business?['latitude']),
      restaurantLng: parseDouble(json['restaurantLongitude']) ??
          parseDouble(restaurant?['longitude']) ??
          parseDouble(business?['longitude']),
      courierFee: assignment?['courierFee'] as num?,
      estimatedCourierFee: json['estimatedCourierFee'] as num?,
      assignmentAcceptedAt: _parseDateTime(assignment?['acceptedAt']),
      createdAt: _parseDateTime(json['createdAt']),
      items: items,
    );
  }

  /// Platform service type — food today; taxi/cargo when new apps connect.
  JobServiceType get serviceType => JobServiceType.food;

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

String? _readBusinessTypeSlug(Map<String, dynamic>? business) {
  if (business == null) return null;
  final type = business['businessType'] as Map<String, dynamic>?;
  return type?['slug'] as String?;
}
