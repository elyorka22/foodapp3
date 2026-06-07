import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'firebase_options.dart';
import 'firebase_push_notification_service.dart';

/// Must match `--dart-define=ENABLE_FCM` in release builds.
const enableFcm = bool.fromEnvironment('ENABLE_FCM', defaultValue: true);

Future<void> _ensureFirebaseInitialized() async {
  if (Firebase.apps.isNotEmpty) return;
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
}

/// Call from main() before runApp — required before any FirebaseMessaging use.
Future<void> bootstrapFirebase() async {
  if (kIsWeb || !enableFcm) return;

  try {
    await _ensureFirebaseInitialized();
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e, st) {
    debugPrint('Firebase bootstrap failed: $e\n$st');
  }
}

bool get isFirebaseReady => Firebase.apps.isNotEmpty;
