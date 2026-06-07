import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

/// Whether the OS will show push notifications (tray + lock screen).
Future<bool> hasPushNotificationPermission() async {
  if (kIsWeb) return false;

  if (Platform.isAndroid) {
    return Permission.notification.isGranted;
  }

  if (Platform.isIOS) {
    final settings = await FirebaseMessaging.instance.getNotificationSettings();
    return settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
  }

  return false;
}

/// Request permission — returns true when notifications can be shown.
Future<bool> requestPushNotificationPermissions() async {
  if (kIsWeb) return false;

  if (Platform.isAndroid) {
    final status = await Permission.notification.status;
    if (status.isGranted) return true;
    final result = await Permission.notification.request();
    return result.isGranted;
  }

  if (Platform.isIOS) {
    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    return settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
  }

  return false;
}
