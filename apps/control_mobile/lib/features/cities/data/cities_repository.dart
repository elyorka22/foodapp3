import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';

class ControlCity {
  const ControlCity({
    required this.id,
    required this.name,
    required this.isActive,
    this.slug,
    this.sortOrder = 0,
    this.isDefault = false,
  });

  final String id;
  final String name;
  final bool isActive;
  final String? slug;
  final int sortOrder;
  final bool isDefault;

  factory ControlCity.fromJson(Map<String, dynamic> json) {
    return ControlCity(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      slug: json['slug'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }
}

class CitiesRepository {
  CitiesRepository(this._dio);
  final Dio _dio;

  Future<List<ControlCity>> fetchCities() async {
    final res = await _dio.get<dynamic>(ApiPaths.citiesAdmin);
    return parseObjectList(res.data).map(ControlCity.fromJson).toList();
  }

  Future<ControlCity> createCity({
    required String name,
    bool isActive = true,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.cities,
      data: {'name': name, 'isActive': isActive},
    );
    return ControlCity.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlCity> updateCity(
    String id, {
    String? name,
    bool? isActive,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.city(id),
      data: {
        if (name != null) 'name': name,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return ControlCity.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteCity(String id) async {
    await _dio.delete<dynamic>(ApiPaths.city(id));
  }
}

final citiesRepositoryProvider = Provider<CitiesRepository>((ref) {
  return CitiesRepository(ref.watch(dioProvider));
});
