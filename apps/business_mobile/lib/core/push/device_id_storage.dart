import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

const _deviceIdKey = 'foodapp_business_device_id';

/// Persistent install id. Prefers prefs; falls back to secure storage / memory
/// so a broken shared_preferences plugin cannot block push registration.
class DeviceIdStorage {
  DeviceIdStorage(this._secure, [this._prefs]);

  final FlutterSecureStorage _secure;
  final SharedPreferences? _prefs;

  String? _memoryId;

  Future<String> getOrCreate() async {
    try {
      final fromPrefs = _prefs?.getString(_deviceIdKey);
      if (fromPrefs != null && fromPrefs.isNotEmpty) return fromPrefs;
    } catch (_) {}

    try {
      final fromSecure = await _secure
          .read(key: _deviceIdKey)
          .timeout(const Duration(seconds: 3));
      if (fromSecure != null && fromSecure.isNotEmpty) {
        try {
          await _prefs?.setString(_deviceIdKey, fromSecure);
        } catch (_) {}
        return fromSecure;
      }
    } catch (_) {}

    if (_memoryId != null && _memoryId!.isNotEmpty) return _memoryId!;

    final id = const Uuid().v4();
    _memoryId = id;
    try {
      await _secure
          .write(key: _deviceIdKey, value: id)
          .timeout(const Duration(seconds: 3));
    } catch (_) {}
    try {
      await _prefs?.setString(_deviceIdKey, id);
    } catch (_) {}
    return id;
  }
}
