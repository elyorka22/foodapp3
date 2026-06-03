import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

import 'delivery_location.dart';
import 'location_failure.dart';
import 'location_storage.dart';

/// Device GPS with permission handling, cache fallback, and timeouts.
class LocationService {
  LocationService(this._storage);

  final LocationStorage _storage;

  static const _gpsTimeout = Duration(seconds: 12);
  LocationFailure? _lastFailure;

  LocationFailure? get lastFailure => _lastFailure;

  Future<CheckoutLocationResult> resolveForCheckout({bool forceRefresh = false}) async {
    _lastFailure = null;

    if (!forceRefresh) {
      final cached = _storage.load();
      if (cached != null) {
        return CheckoutLocationResult(
          location: DeliveryLocation(
            latitude: cached.latitude,
            longitude: cached.longitude,
            address: cached.address,
            source: LocationSource.cached,
          ),
        );
      }
    }

    final gps = await _fetchGps();
    if (gps != null) {
      await _storage.save(
        latitude: gps.latitude,
        longitude: gps.longitude,
        address: gps.address,
        source: 'gps',
      );
      return CheckoutLocationResult(location: gps);
    }

    final cached = _storage.load();
    if (cached != null) {
      return CheckoutLocationResult(
        location: DeliveryLocation(
          latitude: cached.latitude,
          longitude: cached.longitude,
          address: cached.address,
          source: LocationSource.cached,
        ),
        failure: _lastFailure,
      );
    }

    return CheckoutLocationResult(failure: _lastFailure ?? LocationFailure.unavailable);
  }

  Future<DeliveryLocation?> _fetchGps() async {
    try {
      final permission = await _resolvePermission();
      if (permission != null) {
        _lastFailure = permission;
        return null;
      }

      final enabled = await Geolocator.isLocationServiceEnabled();
      if (!enabled) {
        _lastFailure = LocationFailure.serviceDisabled;
        return null;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: _gpsTimeout,
        ),
      );

      return DeliveryLocation(
        latitude: position.latitude,
        longitude: position.longitude,
        source: LocationSource.gps,
        accuracyMeters: position.accuracy,
      );
    } on TimeoutException {
      _lastFailure = LocationFailure.timeout;
      return null;
    } catch (e) {
      debugPrint('LocationService GPS error: $e');
      _lastFailure = LocationFailure.unavailable;
      return null;
    }
  }

  Future<LocationFailure?> _resolvePermission() async {
    var status = await Permission.locationWhenInUse.status;
    if (status.isGranted) return null;

    if (status.isPermanentlyDenied) {
      return LocationFailure.permissionPermanentlyDenied;
    }

    status = await Permission.locationWhenInUse.request();
    if (status.isGranted) return null;
    if (status.isPermanentlyDenied) {
      return LocationFailure.permissionPermanentlyDenied;
    }
    return LocationFailure.permissionDenied;
  }

  Future<void> saveManual({
    required double latitude,
    required double longitude,
    String? address,
  }) async {
    await _storage.save(
      latitude: latitude,
      longitude: longitude,
      address: address,
      source: 'manual',
    );
  }
}
