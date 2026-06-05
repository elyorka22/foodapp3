import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  TokenStorage(this._secure, this._prefs);

  final FlutterSecureStorage _secure;
  final SharedPreferences _prefs;

  static const _tokenKey = 'courier_access_token';
  static const _userJsonKey = 'courier_user_json';
  static const _courierJsonKey = 'courier_profile_json';

  Future<String?> getAccessToken() => _secure.read(key: _tokenKey);

  Future<void> saveSession({
    required String accessToken,
    required String userJson,
    String? courierJson,
  }) async {
    await _secure.write(key: _tokenKey, value: accessToken);
    await _prefs.setString(_userJsonKey, userJson);
    if (courierJson != null) {
      await _prefs.setString(_courierJsonKey, courierJson);
    }
  }

  Future<String?> getUserJson() => _prefs.getString(_userJsonKey);

  Future<String?> getCourierJson() => _prefs.getString(_courierJsonKey);

  Future<void> clear() async {
    await _secure.delete(key: _tokenKey);
    await _prefs.remove(_userJsonKey);
    await _prefs.remove(_courierJsonKey);
  }
}
