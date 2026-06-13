import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/maps/route_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/map_launcher.dart';

class DeliveryMap extends StatefulWidget {
  const DeliveryMap({
    super.key,
    this.courierLat,
    this.courierLng,
    this.restaurantLat,
    this.restaurantLng,
    this.customerLat,
    this.customerLng,
    this.orderStatus,
    this.expanded = false,
    this.showNavButtons = true,
  });

  final double? courierLat;
  final double? courierLng;
  final double? restaurantLat;
  final double? restaurantLng;
  final double? customerLat;
  final double? customerLng;
  final String? orderStatus;
  final bool expanded;
  final bool showNavButtons;

  @override
  State<DeliveryMap> createState() => _DeliveryMapState();
}

class _DeliveryMapState extends State<DeliveryMap> {
  final RouteService _routeService = RouteService();
  List<LatLng> _routePoints = const [];
  bool _routeLoading = false;

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  @override
  void didUpdateWidget(covariant DeliveryMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.courierLat != widget.courierLat ||
        oldWidget.courierLng != widget.courierLng ||
        oldWidget.restaurantLat != widget.restaurantLat ||
        oldWidget.restaurantLng != widget.restaurantLng ||
        oldWidget.customerLat != widget.customerLat ||
        oldWidget.customerLng != widget.customerLng ||
        oldWidget.orderStatus != widget.orderStatus) {
      _loadRoute();
    }
  }

  bool get _navigateToCustomer {
    final status = widget.orderStatus;
    return status == 'PICKED_UP' || status == 'DELIVERING';
  }

  LatLng? get _restaurantPoint {
    if (widget.restaurantLat == null || widget.restaurantLng == null) return null;
    return LatLng(widget.restaurantLat!, widget.restaurantLng!);
  }

  LatLng? get _customerPoint {
    if (widget.customerLat == null || widget.customerLng == null) return null;
    return LatLng(widget.customerLat!, widget.customerLng!);
  }

  LatLng? get _courierPoint {
    if (widget.courierLat == null || widget.courierLng == null) return null;
    return LatLng(widget.courierLat!, widget.courierLng!);
  }

  List<LatLng> get _markerPoints {
    final points = <LatLng>[];
    final courier = _courierPoint;
    final restaurant = _restaurantPoint;
    final customer = _customerPoint;
    if (courier != null) points.add(courier);
    if (restaurant != null) points.add(restaurant);
    if (customer != null) points.add(customer);
    return points;
  }

  LatLng? get _center {
    final points = _routePoints.isNotEmpty ? _routePoints : _markerPoints;
    if (points.isEmpty) return null;
    if (points.length == 1) return points.first;
    var lat = 0.0;
    var lng = 0.0;
    for (final point in points) {
      lat += point.latitude;
      lng += point.longitude;
    }
    return LatLng(lat / points.length, lng / points.length);
  }

  List<LatLng> _waypointsForRoute() {
    final restaurant = _restaurantPoint;
    final customer = _customerPoint;
    final courier = _courierPoint;

    if (_navigateToCustomer) {
      final start = courier ?? restaurant;
      if (start != null && customer != null) return [start, customer];
    } else {
      if (courier != null && restaurant != null) return [courier, restaurant];
      if (restaurant != null && customer != null) return [restaurant, customer];
    }

    return _markerPoints;
  }

  Future<void> _loadRoute() async {
    final waypoints = _waypointsForRoute();
    if (waypoints.length < 2) {
      if (mounted) setState(() => _routePoints = waypoints);
      return;
    }

    setState(() => _routeLoading = true);
    try {
      final route = await _routeService.fetchDrivingRoute(waypoints);
      if (mounted) setState(() => _routePoints = route);
    } catch (_) {
      if (mounted) setState(() => _routePoints = waypoints);
    } finally {
      if (mounted) setState(() => _routeLoading = false);
    }
  }

  void _openNavigation(double lat, double lng, String label) {
    showMapPicker(context, lat, lng, label: label);
  }

  @override
  Widget build(BuildContext context) {
    final center = _center;
    if (center == null) {
      return SizedBox(
        height: widget.expanded ? double.infinity : 220,
        child: const Center(child: Text('Xarita uchun koordinatalar yo\'q')),
      );
    }

    final restaurant = _restaurantPoint;
    final customer = _customerPoint;
    final courier = _courierPoint;
    final routeLine = _routePoints.length >= 2 ? _routePoints : _waypointsForRoute();

    final map = ClipRRect(
      borderRadius: widget.expanded
          ? BorderRadius.zero
          : BorderRadius.circular(AppSpacing.cardRadius),
      child: Stack(
        fit: StackFit.expand,
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: center,
              initialZoom: 13,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.foodapp.courier',
              ),
              if (routeLine.length >= 2)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: routeLine,
                      color: AppColors.mapRoute,
                      strokeWidth: 5,
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  if (courier != null)
                    Marker(
                      point: courier,
                      width: 36,
                      height: 36,
                      child: const _MapMarker(
                        icon: Icons.navigation_rounded,
                        color: AppColors.primary,
                      ),
                    ),
                  if (restaurant != null)
                    Marker(
                      point: restaurant,
                      width: 36,
                      height: 36,
                      child: const _MapMarker(
                        icon: Icons.storefront_rounded,
                        color: AppColors.serviceFood,
                      ),
                    ),
                  if (customer != null)
                    Marker(
                      point: customer,
                      width: 36,
                      height: 36,
                      child: const _MapMarker(
                        icon: Icons.home_rounded,
                        color: AppColors.success,
                      ),
                    ),
                ],
              ),
            ],
          ),
          if (_routeLoading)
            const Positioned(
              top: 12,
              right: 12,
              child: SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
        ],
      ),
    );

    if (widget.expanded) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(child: map),
          if (widget.showNavButtons) _CompactNavButtons(
            restaurant: restaurant,
            customer: customer,
            navigateToCustomer: _navigateToCustomer,
            onNavigate: _openNavigation,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(height: 240, child: map),
        if (widget.showNavButtons) ...[
          const SizedBox(height: AppSpacing.md),
          _CompactNavButtons(
            restaurant: restaurant,
            customer: customer,
            navigateToCustomer: _navigateToCustomer,
            onNavigate: _openNavigation,
          ),
        ],
      ],
    );
  }
}

class _CompactNavButtons extends StatelessWidget {
  const _CompactNavButtons({
    required this.restaurant,
    required this.customer,
    required this.navigateToCustomer,
    required this.onNavigate,
  });

  final LatLng? restaurant;
  final LatLng? customer;
  final bool navigateToCustomer;
  final void Function(double lat, double lng, String label) onNavigate;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      child: Row(
        children: [
          if (restaurant != null)
            Expanded(
              child: _NavChip(
                icon: Icons.storefront_outlined,
                label: AppStrings.navigateToRestaurant,
                primary: !navigateToCustomer,
                onTap: () => onNavigate(
                  restaurant!.latitude,
                  restaurant!.longitude,
                  AppStrings.navigateToRestaurant,
                ),
              ),
            ),
          if (restaurant != null && customer != null) const SizedBox(width: 8),
          if (customer != null)
            Expanded(
              child: _NavChip(
                icon: Icons.home_outlined,
                label: AppStrings.navigateToCustomer,
                primary: navigateToCustomer,
                onTap: () => onNavigate(
                  customer!.latitude,
                  customer!.longitude,
                  AppStrings.navigateToCustomer,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _NavChip extends StatelessWidget {
  const _NavChip({
    required this.icon,
    required this.label,
    required this.primary,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool primary;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: primary ? AppColors.primary : AppColors.surfaceElevated,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: primary ? AppColors.onPrimary : AppColors.textPrimary,
              ),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  style: AppTypography.caption.copyWith(
                    color: primary ? AppColors.onPrimary : AppColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MapMarker extends StatelessWidget {
  const _MapMarker({
    required this.icon,
    required this.color,
  });

  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 34,
      height: 34,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Icon(icon, color: Colors.white, size: 18),
    );
  }
}
