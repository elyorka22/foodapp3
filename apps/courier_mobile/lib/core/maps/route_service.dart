import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';

/// Free driving routes via public OSRM (OpenStreetMap). No API key required.
class RouteService {
  RouteService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                connectTimeout: const Duration(seconds: 12),
                receiveTimeout: const Duration(seconds: 12),
              ),
            );

  final Dio _dio;

  Future<List<LatLng>> fetchDrivingRoute(List<LatLng> waypoints) async {
    if (waypoints.length < 2) return waypoints;

    final coordPath = waypoints
        .map((point) => '${point.longitude},${point.latitude}')
        .join(';');

    final response = await _dio.get<Map<String, dynamic>>(
      'https://router.project-osrm.org/route/v1/driving/$coordPath',
      queryParameters: const {
        'overview': 'full',
        'geometries': 'geojson',
        'steps': 'false',
      },
    );

    final routes = response.data?['routes'] as List<dynamic>?;
    if (routes == null || routes.isEmpty) return waypoints;

    final geometry = routes.first['geometry'] as Map<String, dynamic>?;
    final coordinates = geometry?['coordinates'] as List<dynamic>?;
    if (coordinates == null || coordinates.isEmpty) return waypoints;

    return coordinates
        .map((entry) {
          final pair = entry as List<dynamic>;
          return LatLng(
            (pair[1] as num).toDouble(),
            (pair[0] as num).toDouble(),
          );
        })
        .toList(growable: false);
  }
}
