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
    this.subtotal = 0,
    this.deliveryFee = 0,
    this.customerPhone,
    this.restaurantName,
    this.restaurantId,
    this.courierRequestedAt,
    this.courierName,
    this.courierId,
    this.items = const [],
  });

  final String id;
  final String orderNumber;
  final String status;
  final num total;
  final num subtotal;
  final num deliveryFee;
  final String? customerPhone;
  final String? restaurantName;
  final String? restaurantId;
  final DateTime? courierRequestedAt;
  final String? courierName;
  final String? courierId;
  final List<OrderLineItem> items;

  bool get isCancelled => status == 'CANCELLED';
  bool get isActive => !isCancelled && status != 'DELIVERED';

  bool get canRequestCourier =>
      status == 'PREPARING' && courierRequestedAt == null;

  bool get courierRequested =>
      status == 'PREPARING' && courierRequestedAt != null;

  bool get canAssignCourier =>
      (status == 'PREPARING' && courierRequestedAt != null && courierId == null) ||
      (status == 'COURIER_ASSIGNED' && courierId != null);

  bool get canCancel =>
      status == 'PENDING' || status == 'ACCEPTED' || status == 'PREPARING';

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
    final business = json['business'] as Map<String, dynamic>?;
    final courier = json['courier'] as Map<String, dynamic>?;
    final courierUser = courier?['user'] as Map<String, dynamic>?;
    final itemsRaw = json['items'];

    return StaffOrderModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String? ?? '',
      status: json['status'] as String? ?? '',
      total: json['total'] as num? ?? 0,
      subtotal: json['subtotal'] as num? ?? 0,
      deliveryFee: json['deliveryFee'] as num? ?? 0,
      customerPhone: guest?['phone'] as String?,
      restaurantName: restaurant?['name'] as String? ?? business?['name'] as String?,
      restaurantId: restaurant?['id'] as String? ?? business?['id'] as String?,
      courierRequestedAt: json['courierRequestedAt'] != null
          ? DateTime.tryParse(json['courierRequestedAt'].toString())
          : null,
      courierName: courierUser?['fullName'] as String?,
      courierId: courier?['id'] as String?,
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
    required this.ordersToday,
    required this.ordersWeek,
    required this.ordersMonth,
    required this.revenueToday,
    required this.revenueWeek,
    required this.revenueMonth,
    required this.averageOrderValue,
    this.topProducts = const [],
  });

  final int ordersToday;
  final int ordersWeek;
  final int ordersMonth;
  final num revenueToday;
  final num revenueWeek;
  final num revenueMonth;
  final num averageOrderValue;
  final List<TopProductModel> topProducts;

  factory RestaurantStatsModel.fromJson(Map<String, dynamic> json) {
    final top = json['topProducts'] as List<dynamic>? ?? [];
    return RestaurantStatsModel(
      ordersToday: (json['ordersToday'] as num?)?.toInt() ?? 0,
      ordersWeek: (json['ordersWeek'] as num?)?.toInt() ?? 0,
      ordersMonth: (json['ordersMonth'] as num?)?.toInt() ?? 0,
      revenueToday: json['revenueToday'] as num? ?? 0,
      revenueWeek: json['revenueWeek'] as num? ?? 0,
      revenueMonth: json['revenueMonth'] as num? ?? 0,
      averageOrderValue: json['averageOrderValue'] as num? ?? 0,
      topProducts: top
          .whereType<Map<String, dynamic>>()
          .map(TopProductModel.fromJson)
          .toList(),
    );
  }
}

class TopProductModel {
  const TopProductModel({
    required this.name,
    required this.quantity,
    required this.revenue,
  });

  final String name;
  final int quantity;
  final num revenue;

  factory TopProductModel.fromJson(Map<String, dynamic> json) {
    return TopProductModel(
      name: json['name'] as String? ?? '—',
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      revenue: json['revenue'] as num? ?? 0,
    );
  }
}

class CourierListItemModel {
  const CourierListItemModel({
    required this.id,
    required this.fullName,
    this.phone,
    this.email,
    required this.isOnline,
    required this.isActive,
    this.vehicleType,
    this.totalDeliveries = 0,
  });

  final String id;
  final String fullName;
  final String? phone;
  final String? email;
  final bool isOnline;
  final bool isActive;
  final String? vehicleType;
  final int totalDeliveries;

  factory CourierListItemModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return CourierListItemModel(
      id: json['id'] as String,
      fullName: user?['fullName'] as String? ?? '—',
      phone: user?['phone'] as String?,
      email: user?['email'] as String?,
      isOnline: json['isOnline'] as bool? ?? false,
      isActive: user?['isActive'] as bool? ?? true,
      vehicleType: json['vehicleType'] as String?,
      totalDeliveries: (json['totalDeliveries'] as num?)?.toInt() ?? 0,
    );
  }
}
