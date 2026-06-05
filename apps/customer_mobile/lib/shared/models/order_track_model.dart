import '../../core/utils/json_parse.dart';

class OrderTrackModel {
  const OrderTrackModel({
    required this.id,
    required this.orderNumber,
    required this.trackingToken,
    required this.status,
    required this.total,
    this.subtotal,
    this.deliveryFee,
    this.distanceKm,
    this.items = const [],
    this.restaurantName,
    this.courierName,
    this.courierPhone,
  });

  final String id;
  final String orderNumber;
  final String trackingToken;
  final String status;
  final num total;
  final num? subtotal;
  final num? deliveryFee;
  final num? distanceKm;
  final List<OrderTrackItemModel> items;
  final String? restaurantName;
  final String? courierName;
  final String? courierPhone;

  factory OrderTrackModel.fromJson(Map<String, dynamic> json) {
    final restaurant = json['restaurant'] ?? json['business'];
    String? restaurantName;
    if (restaurant is Map) {
      restaurantName = parseString(restaurant['name']);
    }

    String? courierName;
    String? courierPhone;
    final courier = json['courier'];
    if (courier is Map) {
      courierName = parseString(courier['name']) ??
          (courier['user'] is Map
              ? parseString((courier['user'] as Map)['fullName'])
              : null);
      courierPhone = parseString(courier['phone']) ??
          (courier['user'] is Map
              ? parseString((courier['user'] as Map)['phone'])
              : null);
    }

    final rawItems = json['items'];
    final items = rawItems is List
        ? rawItems
            .whereType<Map>()
            .map((e) => OrderTrackItemModel.fromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <OrderTrackItemModel>[];

    return OrderTrackModel(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String,
      trackingToken: json['trackingToken'] as String,
      status: json['status'] as String,
      total: parseNum(json['total']),
      subtotal: json['subtotal'] != null ? parseNum(json['subtotal']) : null,
      deliveryFee: json['deliveryFee'] != null ? parseNum(json['deliveryFee']) : null,
      distanceKm: json['distanceKm'] != null ? parseNum(json['distanceKm']) : null,
      items: items,
      restaurantName: restaurantName,
      courierName: courierName,
      courierPhone: courierPhone,
    );
  }
}

class OrderTrackItemModel {
  const OrderTrackItemModel({
    required this.name,
    required this.quantity,
    this.price,
  });

  final String name;
  final int quantity;
  final num? price;

  factory OrderTrackItemModel.fromJson(Map<String, dynamic> json) {
    return OrderTrackItemModel(
      name: json['name'] as String,
      quantity: (json['quantity'] as num).toInt(),
      price: json['price'] != null ? parseNum(json['price']) : null,
    );
  }
}
