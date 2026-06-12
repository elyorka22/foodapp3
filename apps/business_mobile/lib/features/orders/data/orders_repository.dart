import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import '../../../shared/models/order_model.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.watch(dioProvider));
});

class OrdersRepository {
  OrdersRepository(this._dio);

  final Dio _dio;

  Future<List<StaffOrderModel>> fetchOrders({String? statusGroup}) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.orders,
      queryParameters: {
        'limit': 50,
        if (statusGroup != null) 'statusGroup': statusGroup,
      },
    );
    return parseListResponse(res.data)
        .map(StaffOrderModel.fromJson)
        .toList();
  }

  Future<void> updateStatus(String orderId, String status, {String? cancelReason}) async {
    await _dio.patch(
      ApiPaths.orderStatus(orderId),
      data: {
        'status': status,
        if (cancelReason != null) 'cancelReason': cancelReason,
      },
    );
  }

  Future<void> requestCourier(String orderId) async {
    await _dio.post(ApiPaths.requestCourier(orderId));
  }

  Future<void> assignCourier(String orderId, String courierId, {String? note}) async {
    await _dio.post(
      ApiPaths.assignCourier(orderId),
      data: {
        'courierId': courierId,
        if (note != null) 'note': note,
      },
    );
  }

  Future<void> reassignCourier(String orderId, String courierId, {String? note}) async {
    await _dio.patch(
      ApiPaths.reassignCourier(orderId),
      data: {
        'courierId': courierId,
        if (note != null) 'note': note,
      },
    );
  }

  Future<void> removeCourier(String orderId) async {
    await _dio.patch(ApiPaths.removeCourier(orderId));
  }
}
