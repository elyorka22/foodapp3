import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/models/order_track_model.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.watch(dioProvider));
});

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

  Future<OrderTrackModel> trackOrder(String trackingToken) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.orderTrack(trackingToken),
    );
    return OrderTrackModel.fromJson(res.data!);
  }
}
