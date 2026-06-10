import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  TokenStorage(this._secure, this._prefs);

  final FlutterSecureStorage _secure;
  final SharedPreferences _prefs;

  static const _tokenKey = 'business_access_token';
  static const _userJsonKey = 'business_user_json';

  Future<String?> getAccessToken() => _secure.read(key: _tokenKey);

  Future<void> saveSession({
    required String accessToken,
    required String userJson,
  }) async {
    await _secure.write(key: _tokenKey, value: accessToken);
    await _prefs.setString(_userJsonKey, userJson);
  }

  Future<String?> getUserJson() async => _prefs.getString(_userJsonKey);

  Future<void> clear() async {
    await _secure.delete(key: _tokenKey);
    await _prefs.remove(_userJsonKey);
  }
}
