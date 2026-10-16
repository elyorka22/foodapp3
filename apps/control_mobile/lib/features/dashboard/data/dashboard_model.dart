import '../../../core/utils/json_parse.dart';

class DashboardRecentOrder {
  const DashboardRecentOrder({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.total,
    this.createdAt,
    this.businessName,
  });

  final String id;
  final String orderNumber;
  final String status;
  final num total;
  final DateTime? createdAt;
  final String? businessName;

  factory DashboardRecentOrder.fromJson(Map<String, dynamic> json) {
    final business = json['business'] as Map<String, dynamic>?;
    final restaurant = json['restaurant'] as Map<String, dynamic>?;
    return DashboardRecentOrder(
      id: json['id'] as String? ?? '',
      orderNumber: json['orderNumber'] as String? ?? '',
      status: json['status'] as String? ?? '',
      total: parseNum(json['total']),
      createdAt: parseDateTime(json['createdAt']),
      businessName:
          business?['name'] as String? ?? restaurant?['name'] as String?,
    );
  }
}

class DashboardMetrics {
  const DashboardMetrics({
    required this.todayOrders,
    required this.pendingOrders,
    required this.deliveredOrders,
    required this.cancelledOrders,
    required this.revenueToday,
    required this.revenueMonth,
    required this.activeCouriers,
    required this.activeRestaurants,
    required this.activeStores,
    this.recentOrders = const [],
  });

  final int todayOrders;
  final int pendingOrders;
  final int deliveredOrders;
  final int cancelledOrders;
  final num revenueToday;
  final num revenueMonth;
  final int activeCouriers;
  final int activeRestaurants;
  final int activeStores;
  final List<DashboardRecentOrder> recentOrders;

  factory DashboardMetrics.fromJson(Map<String, dynamic> json) {
    final recentRaw = json['recentOrders'];
    return DashboardMetrics(
      todayOrders: (json['todayOrders'] as num?)?.toInt() ?? 0,
      pendingOrders: (json['pendingOrders'] as num?)?.toInt() ?? 0,
      deliveredOrders: (json['deliveredOrders'] as num?)?.toInt() ?? 0,
      cancelledOrders: (json['cancelledOrders'] as num?)?.toInt() ?? 0,
      revenueToday: parseNum(json['revenueToday']),
      revenueMonth: parseNum(json['revenueMonth']),
      activeCouriers: (json['activeCouriers'] as num?)?.toInt() ?? 0,
      activeRestaurants: (json['activeRestaurants'] as num?)?.toInt() ?? 0,
      activeStores: (json['activeStores'] as num?)?.toInt() ?? 0,
      recentOrders: recentRaw is List
          ? recentRaw
              .whereType<Map<String, dynamic>>()
              .map(DashboardRecentOrder.fromJson)
              .toList()
          : const [],
    );
  }
}
