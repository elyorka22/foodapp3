import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'firebase_push_notification_service.dart';
import 'push_notification_service.dart';
import 'push_notification_service_stub.dart';

const _enableFcm = bool.fromEnvironment('ENABLE_FCM', defaultValue: true);

final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  if (!_enableFcm) {
    return PushNotificationServiceStub();
  }
  return FirebasePushNotificationService();
});
