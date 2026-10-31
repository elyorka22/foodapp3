import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

const _activeOrderKey = 'foodapp_active_order';

class ActiveOrderRef {
  const ActiveOrderRef({
    required this.token,
    this.orderNumber,
    required this.savedAt,
  });

  final String token;
  final String? orderNumber;
  final String savedAt;

  Map<String, dynamic> toJson() => {
        'token': token,
        if (orderNumber != null) 'orderNumber': orderNumber,
        'savedAt': savedAt,
      };

  factory ActiveOrderRef.fromJson(Map<String, dynamic> json) => ActiveOrderRef(
        token: json['token'] as String,
        orderNumber: json['orderNumber'] as String?,
        savedAt: json['savedAt'] as String? ?? '',
      );
}

class ActiveOrderStorage {
  ActiveOrderStorage(this._prefs);

  final SharedPreferences _prefs;

  ActiveOrderRef? load() {
    final raw = _prefs.getString(_activeOrderKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      final parsed = ActiveOrderRef.fromJson(
        Map<String, dynamic>.from(jsonDecode(raw) as Map),
      );
      final saved = DateTime.tryParse(parsed.savedAt);
      // Drop ancient local refs so empty-server / wiped DBs don't keep a ghost banner.
      if (saved != null &&
          DateTime.now().toUtc().difference(saved) > const Duration(days: 2)) {
        _prefs.remove(_activeOrderKey);
        return null;
      }
      return parsed;
    } catch (_) {
      _prefs.remove(_activeOrderKey);
      return null;
    }
  }

  Future<void> save(String token, {String? orderNumber}) async {
    final payload = ActiveOrderRef(
      token: token,
      orderNumber: orderNumber,
      savedAt: DateTime.now().toUtc().toIso8601String(),
    );
    await _prefs.setString(_activeOrderKey, jsonEncode(payload.toJson()));
  }

  Future<void> clear() async {
    await _prefs.remove(_activeOrderKey);
  }
}
