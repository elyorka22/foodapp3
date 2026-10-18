import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import 'delivery_zone_model.dart';

class DeliveryZonesRepository {
  DeliveryZonesRepository(this._dio);

  final Dio _dio;

  Future<List<ControlDeliveryZone>> fetchZones({String? cityId}) async {
    final res = await _dio.get<dynamic>(
      ApiPaths.deliveryZones,
      queryParameters: {
        if (cityId != null && cityId.isNotEmpty) 'cityId': cityId,
      },
    );
    return parseObjectList(res.data)
        .map(ControlDeliveryZone.fromJson)
        .toList();
  }

  Future<ControlDeliveryZone> createZone({
    required String name,
    required String cityId,
    required double centerLatitude,
    required double centerLongitude,
    required double radiusKm,
    required num baseFee,
    required num pricePerKm,
    required num minDeliveryFee,
    bool isActive = true,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.deliveryZones,
      data: {
        'name': name,
        'cityId': cityId,
        'centerLatitude': centerLatitude,
        'centerLongitude': centerLongitude,
        'radiusKm': radiusKm,
        'baseFee': baseFee,
        'pricePerKm': pricePerKm,
        'minDeliveryFee': minDeliveryFee,
        'isActive': isActive,
      },
    );
    return ControlDeliveryZone.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlDeliveryZone> updateZone(
    String id, {
    String? name,
    String? cityId,
    double? centerLatitude,
    double? centerLongitude,
    double? radiusKm,
    num? baseFee,
    num? pricePerKm,
    num? minDeliveryFee,
    bool? isActive,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.deliveryZone(id),
      data: {
        if (name != null) 'name': name,
        if (cityId != null) 'cityId': cityId,
        if (centerLatitude != null) 'centerLatitude': centerLatitude,
        if (centerLongitude != null) 'centerLongitude': centerLongitude,
        if (radiusKm != null) 'radiusKm': radiusKm,
        if (baseFee != null) 'baseFee': baseFee,
        if (pricePerKm != null) 'pricePerKm': pricePerKm,
        if (minDeliveryFee != null) 'minDeliveryFee': minDeliveryFee,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return ControlDeliveryZone.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteZone(String id) async {
    await _dio.delete<dynamic>(ApiPaths.deliveryZone(id));
  }
}

final deliveryZonesRepositoryProvider =
    Provider<DeliveryZonesRepository>((ref) {
  return DeliveryZonesRepository(ref.watch(dioProvider));
});
