import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'firebase_push_notification_service.dart';

const enableFcm = bool.fromEnvironment('ENABLE_FCM', defaultValue: true);

/// Call from main() before runApp — required before any FirebaseMessaging use.
Future<void> bootstrapFirebase() async {
  if (!enableFcm) return;
  if (Firebase.apps.isNotEmpty) return;

  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e, st) {
    debugPrint('Firebase bootstrap failed: $e\n$st');
  }
}

bool get isFirebaseReady => Firebase.apps.isNotEmpty;
