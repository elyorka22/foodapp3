import 'dart:convert';
import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'native_notification_channel.dart';

final FlutterLocalNotificationsPlugin _localNotifications =
    FlutterLocalNotificationsPlugin();

bool _localNotificationsReady = false;

class RemoteNotificationContent {
  const RemoteNotificationContent({
    required this.title,
    required this.body,
  });

  final String title;
  final String body;
}

RemoteNotificationContent extractNotificationContent(RemoteMessage message) {
  final notification = message.notification;
  final data = message.data;

  return RemoteNotificationContent(
    title: notification?.title ?? data['title'] as String? ?? 'Foodapp Business',
    body: notification?.body ?? data['body'] as String? ?? '',
  );
}

Future<void> ensureLocalNotificationsReady() async {
  if (_localNotificationsReady || kIsWeb) return;

  const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
  await _localNotifications.initialize(
    const InitializationSettings(android: androidInit),
  );

  if (Platform.isAndroid) {
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(foodAppAndroidNotificationChannel);
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(foodAppBusinessUrgentChannel);
  }

  _localNotificationsReady = true;
}

AndroidNotificationDetails resolveAndroidDetails(Map<String, dynamic> data) {
  final type = data['type'] as String? ?? '';
  if (type == 'NEW_ORDER' || type == 'ORDER_PROBLEM') {
    return foodAppBusinessUrgentNotificationDetails;
  }
  return foodAppAndroidNotificationDetails;
}

Future<void> showRemoteMessageNotification(RemoteMessage message) async {
  if (kIsWeb) return;

  final content = extractNotificationContent(message);
  if (content.body.trim().isEmpty && content.title.trim().isEmpty) return;

  await ensureLocalNotificationsReady();

  final data = Map<String, dynamic>.from(message.data);
  await _localNotifications.show(
    message.hashCode,
    content.title,
    content.body,
    NotificationDetails(android: resolveAndroidDetails(data)),
    payload: data.isEmpty ? null : jsonEncode(data),
  );
}
