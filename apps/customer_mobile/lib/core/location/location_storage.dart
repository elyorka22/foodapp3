import 'package:shared_preferences/shared_preferences.dart';

/// Persists last known delivery coordinates between sessions.
class LocationStorage {
  LocationStorage(this._prefs);

  final SharedPreferences _prefs;

  static const _latKey = 'delivery_latitude';
  static const _lngKey = 'delivery_longitude';
  static const _addressKey = 'delivery_address';
  static const _sourceKey = 'delivery_location_source';
  static const _updatedKey = 'delivery_location_updated_ms';

  Future<void> save({
    required double latitude,
    required double longitude,
    String? address,
    required String source,
  }) async {
    await _prefs.setDouble(_latKey, latitude);
    await _prefs.setDouble(_lngKey, longitude);
    if (address != null) {
      await _prefs.setString(_addressKey, address);
    }
    await _prefs.setString(_sourceKey, source);
    await _prefs.setInt(_updatedKey, DateTime.now().millisecondsSinceEpoch);
  }

  StoredLocation? load() {
    final lat = _prefs.getDouble(_latKey);
    final lng = _prefs.getDouble(_lngKey);
    if (lat == null || lng == null) return null;
    return StoredLocation(
      latitude: lat,
      longitude: lng,
      address: _prefs.getString(_addressKey),
      source: _prefs.getString(_sourceKey) ?? 'cached',
      updatedAt: _prefs.getInt(_updatedKey),
    );
  }

  Future<void> clear() async {
    await _prefs.remove(_latKey);
    await _prefs.remove(_lngKey);
    await _prefs.remove(_addressKey);
    await _prefs.remove(_sourceKey);
    await _prefs.remove(_updatedKey);
  }
}

class StoredLocation {
  const StoredLocation({
    required this.latitude,
    required this.longitude,
    this.address,
    required this.source,
    this.updatedAt,
  });

  final double latitude;
  final double longitude;
  final String? address;
  final String source;
  final int? updatedAt;
}
