import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'token_storage.dart';

/// Optional — may be null when the Android shared_preferences plugin is broken.
final sharedPreferencesProvider = Provider<SharedPreferences?>((ref) {
  return null;
});

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  // Avoid encryptedSharedPreferences — it can hang indefinitely on some
  // Android devices during first read and leave the UI on the Flutter splash.
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(),
  );
});

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage(
    ref.watch(secureStorageProvider),
    ref.watch(sharedPreferencesProvider),
  );
});
