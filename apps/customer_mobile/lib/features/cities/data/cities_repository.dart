import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../models/city_model.dart';

final citiesRepositoryProvider = Provider<CitiesRepository>((ref) {
  return CitiesRepository(ref.watch(dioProvider));
});

class CitiesRepository {
  CitiesRepository(this._dio);

  final Dio _dio;

  Future<List<CityModel>> fetchCities() async {
    final res = await _dio.get<List<dynamic>>(ApiPaths.cities);
    return (res.data ?? [])
        .whereType<Map>()
        .map((e) => CityModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
}
