import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/paginated_response.dart';
import 'order_model.dart';

class OrderListStats {
  const OrderListStats({
    this.total = 0,
    this.active = 0,
    this.delivered = 0,
    this.cancelled = 0,
    this.amount = 0,
  });

  final int total;
  final int active;
  final int delivered;
  final int cancelled;
  final num amount;

  factory OrderListStats.fromJson(Map<String, dynamic>? json) {
    final map = json ?? const <String, dynamic>{};
    return OrderListStats(
      total: (map['total'] as num?)?.toInt() ?? 0,
      active: (map['active'] as num?)?.toInt() ?? 0,
      delivered: (map['delivered'] as num?)?.toInt() ?? 0,
      cancelled: (map['cancelled'] as num?)?.toInt() ?? 0,
      amount: map['amount'] as num? ?? 0,
    );
  }
}

class OrdersListResult {
  const OrdersListResult({required this.page, required this.stats});

  final PaginatedResponse<ControlOrder> page;
  final OrderListStats stats;
}

class OrdersRepository {
  OrdersRepository(this._dio);

  final Dio _dio;

  /// `GET /orders?page&limit`
  Future<OrdersListResult> fetchOrders({
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
    final raw = res.data ?? <String, dynamic>{};
    return OrdersListResult(
      page: PaginatedResponse.fromJson(raw, ControlOrder.fromJson),
      stats: OrderListStats.fromJson(raw['summary'] as Map<String, dynamic>?),
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
