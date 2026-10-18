import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Business session storage. Keys must not collide with Control/Courier/Customer.
///
/// Access token + user JSON live in [FlutterSecureStorage] so a broken
/// `shared_preferences` Android plugin cannot block login / boot.
/// [SharedPreferences] is optional (legacy migration only).
class TokenStorage {
  TokenStorage(this._secure, [this._prefs]);

  final FlutterSecureStorage _secure;
  final SharedPreferences? _prefs;

  static const _tokenKey = 'business_access_token';
  static const _userJsonKey = 'business_user_json';
  /// Legacy prefs key — migrated once into secure storage.
  static const _legacyUserPrefsKey = 'business_user_json';

  String? _cachedToken;
  String? _cachedUserJson;
  bool _tokenLoaded = false;
  bool _userLoaded = false;
  Future<String?>? _tokenLoadFuture;
  Future<String?>? _userLoadFuture;

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
  }) async {
    try {
      await Future.wait([
        _secure.write(key: _tokenKey, value: accessToken),
        _secure.write(key: _userJsonKey, value: userJson),
      ]).timeout(const Duration(seconds: 5));
    } catch (e) {
      throw Exception(
        'Sessiyani saqlab bo\'lmadi. Qurilma xavfsiz xotirasini tekshiring.',
      );
    }
    try {
      await _prefs?.setString(_legacyUserPrefsKey, userJson);
    } catch (_) {}

    _cachedToken = accessToken;
    _cachedUserJson = userJson;
    _tokenLoaded = true;
    _userLoaded = true;
    _tokenLoadFuture = null;
    _userLoadFuture = null;
  }

  Future<String?> getUserJson() {
    if (_userLoaded) return Future<String?>.value(_cachedUserJson);
    _userLoadFuture ??= _loadUserJson();
    return _userLoadFuture!;
  }

  Future<String?> _loadUserJson() async {
    try {
      _cachedUserJson = await _secure
          .read(key: _userJsonKey)
          .timeout(const Duration(seconds: 3));
    } catch (_) {
      _cachedUserJson = null;
    }

    final prefs = _prefs;
    if ((_cachedUserJson == null || _cachedUserJson!.isEmpty) &&
        prefs != null) {
      try {
        final legacy = prefs.getString(_legacyUserPrefsKey);
        if (legacy != null && legacy.isNotEmpty) {
          _cachedUserJson = legacy;
          try {
            await _secure
                .write(key: _userJsonKey, value: legacy)
                .timeout(const Duration(seconds: 3));
          } catch (_) {}
        }
      } catch (_) {}
    }

    _userLoaded = true;
    return _cachedUserJson;
  }

  Future<void> clear() async {
    try {
      await Future.wait([
        _secure.delete(key: _tokenKey),
        _secure.delete(key: _userJsonKey),
      ]).timeout(const Duration(seconds: 3));
    } catch (_) {}
    try {
      await _prefs?.remove(_legacyUserPrefsKey);
    } catch (_) {}
    _cachedToken = null;
    _cachedUserJson = null;
    _tokenLoaded = true;
    _userLoaded = true;
    _tokenLoadFuture = null;
    _userLoadFuture = null;
  }
}
