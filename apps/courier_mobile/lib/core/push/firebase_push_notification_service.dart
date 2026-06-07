import 'dart:convert';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'notification_permissions.dart';
import 'push_notification_service.dart';

const foodAppNotificationChannelId = 'foodapp_default';
const foodAppNotificationChannelName = 'FoodApp notifications';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Courier FCM background: ${message.messageId}');
}

/// FCM transport for courier app.
class FirebasePushNotificationService implements PushNotificationService {
  FirebasePushNotificationService();

  bool _initialized = false;

  FirebaseMessaging get _messaging => FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  void Function(Map<String, dynamic> data)? _foregroundHandler;
  void Function(Map<String, dynamic> data)? _tapHandler;
  void Function(String token)? _tokenRefreshHandler;

  @override
  Future<void> initialize() async {
    if (_initialized) return;

    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp();
    }

    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    await _localNotifications.initialize(
      const InitializationSettings(android: androidInit),
      onDidReceiveNotificationResponse: (response) {
        final payload = response.payload;
        if (payload == null || payload.isEmpty) return;
        _dispatchTap(Map<String, dynamic>.from(jsonDecode(payload) as Map));
      },
    );

    const channel = AndroidNotificationChannel(
      foodAppNotificationChannelId,
      foodAppNotificationChannelName,
      importance: Importance.high,
    );
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    await requestPushNotificationPermissions();

    FirebaseMessaging.onMessage.listen(_onForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_onMessageOpenedApp);
    _messaging.onTokenRefresh.listen((token) {
      _tokenRefreshHandler?.call(token);
    });

    _initialized = true;
  }

  @override
  Future<String?> getDeviceToken() async {
    if (Firebase.apps.isEmpty) return null;
    try {
      return await _messaging.getToken();
    } catch (e) {
      debugPrint('Courier FCM getToken failed: $e');
      return null;
    }
  }

  @override
  void onForegroundMessage(void Function(Map<String, dynamic> data) handler) {
    _foregroundHandler = handler;
  }

  @override
  void onNotificationTap(void Function(Map<String, dynamic> data) handler) {
    _tapHandler = handler;
  }

  @override
  void onTokenRefresh(void Function(String token) handler) {
    _tokenRefreshHandler = handler;
  }

  @override
  Future<Map<String, dynamic>?> getInitialNotificationData() async {
    final message = await _messaging.getInitialMessage();
    if (message == null) return null;
    return Map<String, dynamic>.from(message.data);
  }

  void _onForegroundMessage(RemoteMessage message) {
    final data = Map<String, dynamic>.from(message.data);
    _foregroundHandler?.call(data);
    _showLocalNotification(message, data);
  }

  void _onMessageOpenedApp(RemoteMessage message) {
    _dispatchTap(Map<String, dynamic>.from(message.data));
  }

  void _dispatchTap(Map<String, dynamic> data) {
    _tapHandler?.call(data);
  }

  Future<void> _showLocalNotification(
    RemoteMessage message,
    Map<String, dynamic> data,
  ) async {
    final notification = message.notification;
    await _localNotifications.show(
      message.hashCode,
      notification?.title ?? 'FoodApp Courier',
      notification?.body ?? '',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          foodAppNotificationChannelId,
          foodAppNotificationChannelName,
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
      payload: jsonEncode(data),
    );
  }
}
