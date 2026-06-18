import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  TokenStorage(this._secure, this._prefs);

  final FlutterSecureStorage _secure;
  final SharedPreferences _prefs;

  static const _tokenKey = 'courier_access_token';
  static const _userJsonKey = 'courier_user_json';
  static const _courierJsonKey = 'courier_profile_json';

  String? _cachedToken;
  bool _tokenLoaded = false;
  Future<String?>? _tokenLoadFuture;

  Future<String?> getAccessToken() {
    if (_tokenLoaded) return Future<String?>.value(_cachedToken);
    _tokenLoadFuture ??= _loadAccessToken();
    return _tokenLoadFuture!;
  }

  Future<String?> _loadAccessToken() async {
    try {
      _cachedToken = await _secure
          .read(key: _tokenKey)
          .timeout(const Duration(seconds: 3));
    } catch (_) {
      _cachedToken = null;
    } finally {
      _tokenLoaded = true;
    }
    return _cachedToken;
  }

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
    _cachedToken = accessToken;
    _tokenLoaded = true;
    _tokenLoadFuture = null;
  }

  Future<String?> getUserJson() async => _prefs.getString(_userJsonKey);

  Future<String?> getCourierJson() async => _prefs.getString(_courierJsonKey);

  Future<void> clear() async {
    await _secure.delete(key: _tokenKey);
    await _prefs.remove(_userJsonKey);
    await _prefs.remove(_courierJsonKey);
    _cachedToken = null;
    _tokenLoaded = true;
    _tokenLoadFuture = null;
  }
}
