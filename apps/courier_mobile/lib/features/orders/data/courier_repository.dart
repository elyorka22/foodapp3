import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../shared/models/courier_earnings_model.dart';
import '../../../shared/models/courier_shift_stats_model.dart';
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

  Future<void> setOnline(bool isOnline) async {
    await _dio.patch<void>(ApiPaths.courierOnline, data: {'isOnline': isOnline});
  }

  Future<void> updateLocation(double latitude, double longitude) async {
    await _dio.patch<void>(
      ApiPaths.courierLocation,
      data: {'latitude': latitude, 'longitude': longitude},
    );
  }

  Future<List<CourierOrderModel>> fetchAvailableOrders() async {
    final res = await _dio.get<List<dynamic>>(ApiPaths.courierAvailableOrders);
    return (res.data ?? [])
        .map((e) => CourierOrderModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<CourierOrderModel>> fetchMyOrders({String? status}) async {
    final res = await _dio.get<Map<String, dynamic>>(
      ApiPaths.orders,
      queryParameters: {
        'limit': 50,
        if (status != null) 'status': status,
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
      queryParameters: {'status': 'DELIVERED', 'limit': 30},
    );
    final data = res.data?['data'] as List<dynamic>? ?? [];
    return data
        .map((e) => CourierOrderModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
