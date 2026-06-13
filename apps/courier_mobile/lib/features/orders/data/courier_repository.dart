import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/courier_earnings_model.dart';
import '../../../shared/models/courier_shift_stats_model.dart';
import '../../../shared/models/courier_weekly_stats_model.dart';
import '../../../shared/models/courier_model.dart';
import '../../../shared/models/courier_order_model.dart';

final courierRepositoryProvider = Provider<CourierRepository>((ref) {
  return CourierRepository(ref.watch(dioProvider));
});

class CourierRepository {
  CourierRepository(this._dio);

  final Dio _dio;

  Future<CourierProfileModel> fetchMe() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.courierMe);
    return CourierProfileModel.fromJson(res.data!);
  }

  Future<CourierEarningsModel> fetchEarnings() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.courierEarnings);
    return CourierEarningsModel.fromJson(res.data ?? {});
  }

  Future<CourierShiftStatsModel> fetchShiftStats() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.courierShiftStats);
    return CourierShiftStatsModel.fromJson(res.data ?? {});
  }

  Future<CourierWeeklyStatsModel> fetchWeeklyStats() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.courierWeeklyStats);
    return CourierWeeklyStatsModel.fromJson(res.data ?? {});
  }

  Future<void> setOnline(bool isOnline) async {
    await _dio.patch<void>(ApiPaths.courierOnline, data: {'isOnline': isOnline});
  }

  Future<void> updateLocation(double latitude, double longitude) async {
    await _dio.patch<void>(
      ApiPaths.courierLocation,
      data: {'latitude': latitude, 'longitude': longitude},
    );
  }

  List<CourierOrderModel> _parseOrderList(dynamic raw) {
    final List<dynamic> rows;
    if (raw is List) {
      rows = raw;
    } else if (raw is Map<String, dynamic>) {
      rows = raw['data'] as List<dynamic>? ?? [];
    } else {
      rows = const [];
    }

    final orders = <CourierOrderModel>[];
    for (final row in rows) {
      if (row is! Map<String, dynamic>) continue;
      try {
        orders.add(CourierOrderModel.fromJson(row));
      } catch (_) {
        // Skip malformed rows instead of failing the whole inbox.
      }
    }
    return orders
        .where((order) => !order.isCancelled && !order.isDelivered)
        .toList();
  }

  List<CourierOrderModel> _mergeOrderLists(
    List<CourierOrderModel> primary,
    List<CourierOrderModel> secondary,
  ) {
    final merged = [...primary];
    final seen = primary.map((order) => order.id).toSet();
    for (final order in secondary) {
      if (seen.add(order.id)) merged.add(order);
    }
    return merged;
  }

  Future<List<CourierOrderModel>> fetchAvailableOrders() async {
    final res = await _dio.get<dynamic>(ApiPaths.courierAvailableOrders);
    return _parseOrderList(res.data);
  }

  /// Primary home inbox — one API call with server-side accept/continue classification.
  Future<List<CourierOrderModel>> fetchHomeInbox() async {
    List<CourierOrderModel> inbox;
    try {
      final res = await _dio.get<dynamic>(ApiPaths.courierInbox);
      inbox = _parseOrderList(res.data);
    } on DioException catch (e) {
      final status =
          (e.error is ApiException) ? (e.error as ApiException).statusCode : e.response?.statusCode;
      if (status == 404) {
        return _fetchHomeInboxLegacy();
      }
      rethrow;
    }

    if (!inbox.any((order) => order.isPendingOffer || order.isOngoingJob)) {
      try {
        final available = await fetchAvailableOrders();
        inbox = _mergeOrderLists(inbox, available);
      } catch (_) {}
    }

    return inbox;
  }

  /// Fallback for servers without `/couriers/me/inbox` yet.
  Future<List<CourierOrderModel>> _fetchHomeInboxLegacy() async {
    final items = <CourierOrderModel>[];
    final seen = <String>{};

    void add(CourierOrderModel order) {
      if (order.isCancelled || order.isDelivered) return;
      if (!order.isPendingOffer && !order.isOngoingJob) return;
      if (seen.add(order.id)) items.add(order);
    }

    try {
      for (final order in await fetchMyOrders(statusGroup: 'active')) {
        add(order);
      }
    } catch (_) {}

    try {
      for (final order in await fetchAvailableOrders()) {
        add(order);
      }
    } catch (_) {}

    items.sort((a, b) {
      final byKind = (a.isPendingOffer ? 0 : 1).compareTo(b.isPendingOffer ? 0 : 1);
      if (byKind != 0) return byKind;
      return (b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0))
          .compareTo(a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0));
    });

    return items;
  }

  Future<List<CourierOrderModel>> fetchInboxOffers() => fetchHomeInbox();

  Future<List<CourierOrderModel>> fetchMyOrders({
    String? status,
    String? statusGroup,
  }) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.orders,
      queryParameters: {
        'limit': 50,
        if (status != null) 'status': status,
        if (statusGroup != null) 'statusGroup': statusGroup,
      },
    );
    final data = res.data?['data'] as List<dynamic>? ?? [];
    return data
        .map((e) => CourierOrderModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<CourierOrderModel> fetchOrder(String id) async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.order(id));
    return CourierOrderModel.fromJson(res.data!);
  }

  Future<CourierOrderModel> acceptOrder(String id) async {
    final res = await _dio.post<Map<String, dynamic>>(ApiPaths.orderAccept(id));
    return CourierOrderModel.fromJson(res.data!);
  }

  Future<void> declineOrder(String id, {String? reason}) async {
    await _dio.post<void>(
      ApiPaths.courierDeclineOrder(id),
      data: {if (reason != null) 'reason': reason},
    );
  }

  Future<CourierOrderModel> updateStatus(String id, String status) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.orderStatus(id),
      data: {'status': status},
    );
    return CourierOrderModel.fromJson(res.data!);
  }

  Future<List<CourierOrderModel>> fetchHistory() async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.orders,
      queryParameters: {'status': 'DELIVERED', 'limit': 50},
    );
    final data = res.data?['data'] as List<dynamic>? ?? [];
    return data
        .map((e) => CourierOrderModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
