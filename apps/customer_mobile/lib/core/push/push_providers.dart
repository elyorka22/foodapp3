import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'push_notification_service.dart';
import 'push_notification_service_stub.dart';

/// Default: noop push (no Firebase). Re-enable FCM later via dormant Firebase module + pubspec.
final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationServiceStub();
});
