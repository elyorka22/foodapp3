import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

const _deviceIdKey = 'foodapp_courier_device_id';

/// Stable per-install device identifier for `user_devices.device_id`.
class DeviceIdStorage {
  DeviceIdStorage(this._prefs);

  final SharedPreferences _prefs;

  Future<String> getOrCreate() async {
    final existing = _prefs.getString(_deviceIdKey);
    if (existing != null && existing.isNotEmpty) return existing;
    final id = const Uuid().v4();
    await _prefs.setString(_deviceIdKey, id);
    return id;
  }
}
