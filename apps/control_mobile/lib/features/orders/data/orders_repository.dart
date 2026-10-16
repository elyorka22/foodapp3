import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import 'order_model.dart';

class OrdersRepository {
  OrdersRepository(this._dio);

  final Dio _dio;

  /// `GET /orders?page&limit`
  Future<PaginatedResponse<ControlOrder>> fetchOrders({
    int page = 1,
    int limit = 20,
    Map<String, dynamic>? query,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.orders,
      queryParameters: {
        'page': page,
        'limit': limit,
        ...?query,
      },
    );
    return PaginatedResponse.fromJson(
      res.data ?? <String, dynamic>{},
      ControlOrder.fromJson,
    );
  }

  /// `GET /orders/:id`
  Future<ControlOrder> fetchOrder(String id) async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.order(id));
    return ControlOrder.fromJson(res.data ?? <String, dynamic>{});
  }

  /// `PATCH /orders/:id/status`
  Future<void> updateStatus(
    String id, {
    required String status,
    String? cancelReason,
    String? courierId,
  }) async {
    await _dio.patch<dynamic>(
      ApiPaths.orderStatus(id),
      data: {
        'status': status,
        if (cancelReason != null && cancelReason.isNotEmpty)
          'cancelReason': cancelReason,
        if (courierId != null && courierId.isNotEmpty) 'courierId': courierId,
      },
    );
  }

  /// `POST /orders/:id/assign-courier`
  Future<void> assignCourier(
    String id, {
    required String courierId,
    String? note,
  }) async {
    await _dio.post<dynamic>(
      ApiPaths.orderAssignCourier(id),
      data: {
        'courierId': courierId,
        if (note != null && note.isNotEmpty) 'note': note,
      },
    );
  }

  /// `PATCH /orders/:id/reassign-courier`
  Future<void> reassignCourier(
    String id, {
    required String courierId,
    String? note,
  }) async {
    await _dio.patch<dynamic>(
      ApiPaths.orderReassignCourier(id),
      data: {
        'courierId': courierId,
        if (note != null && note.isNotEmpty) 'note': note,
      },
    );
  }

  /// `PATCH /orders/:id/remove-courier`
  Future<void> removeCourier(String id) async {
    await _dio.patch<dynamic>(ApiPaths.orderRemoveCourier(id));
  }

  /// `POST /orders/:id/request-courier`
  Future<void> requestCourier(String id) async {
    await _dio.post<dynamic>(ApiPaths.orderRequestCourier(id));
  }
}

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.watch(dioProvider));
});
