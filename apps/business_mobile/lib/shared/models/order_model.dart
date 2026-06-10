class OrderLineItem {
  const OrderLineItem({
    required this.name,
    required this.quantity,
    required this.price,
    required this.subtotal,
  });

  final String name;
  final int quantity;
  final num price;
  final num subtotal;

  factory OrderLineItem.fromJson(Map<String, dynamic> json) {
    return OrderLineItem(
      name: json['name'] as String? ?? '—',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      price: json['price'] as num? ?? 0,
      subtotal: json['subtotal'] as num? ?? 0,
    );
  }
}

class StaffOrderModel {
  StaffOrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.total,
    this.customerPhone,
    this.restaurantName,
    this.courierRequestedAt,
    this.courierName,
    this.items = const [],
  });

  final String id;
  final String orderNumber;
  final String status;
  final num total;
  final String? customerPhone;
  final String? restaurantName;
  final DateTime? courierRequestedAt;
  final String? courierName;
  final List<OrderLineItem> items;

  bool get canRequestCourier =>
      status == 'PREPARING' && courierRequestedAt == null;

  bool get courierRequested =>
      status == 'PREPARING' && courierRequestedAt != null;

  bool get canAssignCourier =>
      status == 'PREPARING' && courierRequestedAt != null && courierName == null;

  String? get nextStatus => _nextStatusMap[status];

  static const _nextStatusMap = {
    'PENDING': 'ACCEPTED',
    'ACCEPTED': 'PREPARING',
    'COURIER_ASSIGNED': 'ARRIVED_AT_RESTAURANT',
    'ARRIVED_AT_RESTAURANT': 'PICKED_UP',
    'PICKED_UP': 'DELIVERING',
    'DELIVERING': 'DELIVERED',
  };

  factory StaffOrderModel.fromJson(Map<String, dynamic> json) {
    final guest = json['guestOrder'] as Map<String, dynamic>?;
    final restaurant = json['restaurant'] as Map<String, dynamic>?;
    final courier = json['courier'] as Map<String, dynamic>?;
    final courierUser = courier?['user'] as Map<String, dynamic>?;
    final itemsRaw = json['items'];

    return StaffOrderModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String? ?? '',
      status: json['status'] as String? ?? '',
      total: json['total'] as num? ?? 0,
      customerPhone: guest?['phone'] as String?,
      restaurantName: restaurant?['name'] as String?,
      courierRequestedAt: json['courierRequestedAt'] != null
          ? DateTime.tryParse(json['courierRequestedAt'].toString())
          : null,
      courierName: courierUser?['fullName'] as String?,
      items: itemsRaw is List
          ? itemsRaw
              .whereType<Map<String, dynamic>>()
              .map(OrderLineItem.fromJson)
              .toList()
          : const [],
    );
  }
}

class RestaurantStatsModel {
  const RestaurantStatsModel({
    required this.totalOrders,
    required this.revenue,
  });

  final int totalOrders;
  final num revenue;

  factory RestaurantStatsModel.fromJson(Map<String, dynamic> json) {
    return RestaurantStatsModel(
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
      revenue: json['revenue'] as num? ?? 0,
    );
  }
}

class RestaurantSummaryModel {
  const RestaurantSummaryModel({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;

  factory RestaurantSummaryModel.fromJson(Map<String, dynamic> json) {
    return RestaurantSummaryModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
    );
  }
}

class CourierListItemModel {
  const CourierListItemModel({
    required this.id,
    required this.fullName,
    this.phone,
    required this.isOnline,
    required this.isActive,
  });

  final String id;
  final String fullName;
  final String? phone;
  final bool isOnline;
  final bool isActive;

  factory CourierListItemModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return CourierListItemModel(
      id: json['id'] as String,
      fullName: user?['fullName'] as String? ?? '—',
      phone: user?['phone'] as String?,
      isOnline: json['isOnline'] as bool? ?? false,
      isActive: user?['isActive'] as bool? ?? true,
    );
  }
}
