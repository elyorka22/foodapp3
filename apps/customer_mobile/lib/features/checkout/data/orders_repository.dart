import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/models/order_track_model.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.watch(dioProvider));
});

class DeliveryQuoteModel {
  const DeliveryQuoteModel({
    required this.distanceKm,
    required this.billableDistanceKm,
    required this.deliveryFee,
    this.perKmFee,
  });

  final num distanceKm;
  final num billableDistanceKm;
  final num deliveryFee;
  final num? perKmFee;

  factory DeliveryQuoteModel.fromJson(Map<String, dynamic> json) {
    return DeliveryQuoteModel(
      distanceKm: json['distanceKm'] as num,
      billableDistanceKm: (json['billableDistanceKm'] ?? json['distanceKm']) as num,
      deliveryFee: json['deliveryFee'] as num,
      perKmFee: (json['perKmFee'] ?? json['pricePerKm']) as num?,
    );
  }
}

class PromoValidateResult {
  const PromoValidateResult({
    required this.valid,
    this.message,
    required this.discount,
  });

  final bool valid;
  final String? message;
  final num discount;
}

class OrdersRepository {
  OrdersRepository(this._dio);

  final Dio _dio;

  Future<GuestOrderResponseModel> createGuestOrder(CreateGuestOrderModel order) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.ordersGuest,
      data: order.toJson(),
    );
    return GuestOrderResponseModel.fromJson(res.data!);
  }

  Future<DeliveryQuoteModel> fetchDeliveryQuote({
    required String restaurantId,
    required double latitude,
    required double longitude,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.ordersDeliveryQuote,
      data: {
        'restaurantId': restaurantId,
        'latitude': latitude,
        'longitude': longitude,
      },
    );
    return DeliveryQuoteModel.fromJson(res.data!);
  }

  Future<PromoValidateResult> validatePromoCode({
    required String code,
    required String restaurantId,
    required num subtotal,
    String? customerId,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.promoCodesValidate,
      data: {
        'code': code.trim(),
        'restaurantId': restaurantId,
        'subtotal': subtotal,
        if (customerId != null) 'customerId': customerId,
      },
    );
    final data = res.data ?? {};
    return PromoValidateResult(
      valid: data['valid'] as bool? ?? false,
      message: data['message'] as String?,
      discount: (data['discount'] as num?) ?? 0,
    );
  }

  Future<OrderTrackModel> trackOrder(String trackingToken) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.orderTrack(trackingToken),
    );
    return OrderTrackModel.fromJson(res.data!);
  }
}
