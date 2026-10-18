import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'firebase_push_notification_service.dart';

const enableFcm = bool.fromEnvironment('ENABLE_FCM', defaultValue: true);

/// Register the FCM background handler only — do not await Firebase.initializeApp
/// here. Awaiting native init before [runApp] can leave the Flutter splash forever
/// on some devices. Full init happens in [FirebasePushNotificationService].
Future<void> bootstrapFirebase() async {
  if (!enableFcm) return;

  try {
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e, st) {
    debugPrint('Firebase bootstrap failed: $e\n$st');
  }
}
