import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'firebase_bootstrap.dart';
import 'firebase_push_notification_service.dart';
import 'push_notification_service.dart';
import 'push_notification_service_stub.dart';

final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  if (!enableFcm) {
    return PushNotificationServiceStub();
  }
  return FirebasePushNotificationService();
});
