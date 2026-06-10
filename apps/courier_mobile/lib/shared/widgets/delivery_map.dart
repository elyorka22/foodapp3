import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_spacing.dart';
import 'food_app_button.dart';

class DeliveryMap extends StatelessWidget {
  const DeliveryMap({
    super.key,
    this.courierLat,
    this.courierLng,
    this.restaurantLat,
    this.restaurantLng,
    this.customerLat,
    this.customerLng,
  });

  final double? courierLat;
  final double? courierLng;
  final double? restaurantLat;
  final double? restaurantLng;
  final double? customerLat;
  final double? customerLng;

  List<LatLng> get _points {
    final points = <LatLng>[];
    if (courierLat != null && courierLng != null) {
      points.add(LatLng(courierLat!, courierLng!));
    }
    if (restaurantLat != null && restaurantLng != null) {
      points.add(LatLng(restaurantLat!, restaurantLng!));
    }
    if (customerLat != null && customerLng != null) {
      points.add(LatLng(customerLat!, customerLng!));
    }
    return points;
  }

  LatLng? get _center {
    final points = _points;
    if (points.isEmpty) return null;
    if (points.length == 1) return points.first;
    var lat = 0.0;
    var lng = 0.0;
    for (final p in points) {
      lat += p.latitude;
      lng += p.longitude;
    }
    return LatLng(lat / points.length, lng / points.length);
  }

  @override
  Widget build(BuildContext context) {
    final center = _center;
    if (center == null) {
      return const SizedBox(
        height: 220,
        child: Center(child: Text('Xarita uchun koordinatalar yo\'q')),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
          child: SizedBox(
            height: 220,
            child: FlutterMap(
              options: MapOptions(initialCenter: center, initialZoom: 13),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.foodapp.courier',
                ),
                if (_points.length >= 2)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _points,
                        color: const Color(0xFFFF6B00),
                        strokeWidth: 4,
                      ),
                    ],
                  ),
                MarkerLayer(
                  markers: [
                    if (courierLat != null && courierLng != null)
                      Marker(
                        point: LatLng(courierLat!, courierLng!),
                        width: 36,
                        height: 36,
                        child: const Icon(Icons.delivery_dining, color: Color(0xFFFF6B00)),
                      ),
                    if (restaurantLat != null && restaurantLng != null)
                      Marker(
                        point: LatLng(restaurantLat!, restaurantLng!),
                        width: 36,
                        height: 36,
                        child: const Icon(Icons.store, color: Colors.blue),
                      ),
                    if (customerLat != null && customerLng != null)
                      Marker(
                        point: LatLng(customerLat!, customerLng!),
                        width: 36,
                        height: 36,
                        child: const Icon(Icons.person_pin_circle, color: Colors.green),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        if (restaurantLat != null && restaurantLng != null)
          FoodAppButton(
            label: AppStrings.navigateToRestaurant,
            variant: FoodAppButtonVariant.secondary,
            onPressed: () => _openMaps(restaurantLat!, restaurantLng!),
          ),
        if (customerLat != null && customerLng != null) ...[
          const SizedBox(height: AppSpacing.sm),
          FoodAppButton(
            label: AppStrings.navigateToCustomer,
            variant: FoodAppButtonVariant.secondary,
            onPressed: () => _openMaps(customerLat!, customerLng!),
          ),
        ],
      ],
    );
  }

  Future<void> _openMaps(double lat, double lng) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving',
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}
