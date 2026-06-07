class GuestOrderItemModel {
  const GuestOrderItemModel({
    required this.productId,
    required this.quantity,
  });

  final String productId;
  final int quantity;

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'quantity': quantity,
      };
}

class CreateGuestOrderModel {
  const CreateGuestOrderModel({
    required this.restaurantId,
    required this.phone,
    required this.deliveryAddress,
    required this.latitude,
    required this.longitude,
    required this.items,
    this.comment,
    this.customerId,
    this.promoCode,
    this.deviceId,
  });

  final String restaurantId;
  final String phone;
  final String deliveryAddress;
  final double latitude;
  final double longitude;
  final List<GuestOrderItemModel> items;
  final String? comment;
  final String? customerId;
  final String? promoCode;
  final String? deviceId;

  Map<String, dynamic> toJson() => {
        'restaurantId': restaurantId,
        'phone': phone,
        'deliveryAddress': deliveryAddress,
        'latitude': latitude,
        'longitude': longitude,
        'items': items.map((e) => e.toJson()).toList(),
        if (comment != null) 'comment': comment,
        if (customerId != null) 'customerId': customerId,
        if (promoCode != null) 'promoCode': promoCode,
        if (deviceId != null && deviceId!.isNotEmpty) 'deviceId': deviceId,
      };
}

class GuestOrderResponseModel {
  const GuestOrderResponseModel({
    required this.id,
    required this.orderNumber,
    this.trackingToken,
    this.trackingUrl,
  });

  final String id;
  final String orderNumber;
  final String? trackingToken;
  final String? trackingUrl;

  factory GuestOrderResponseModel.fromJson(Map<String, dynamic> json) {
    final order = json['order'];
    final src = order is Map<String, dynamic> ? order : json;
    return GuestOrderResponseModel(
      id: src['id'] as String,
      orderNumber: src['orderNumber'] as String,
      trackingToken: src['trackingToken'] as String?,
      trackingUrl: json['trackingUrl'] as String?,
    );
  }
}
