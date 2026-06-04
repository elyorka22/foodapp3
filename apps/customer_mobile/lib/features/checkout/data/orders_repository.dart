import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/models/order_track_model.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.watch(dioProvider));
});

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
