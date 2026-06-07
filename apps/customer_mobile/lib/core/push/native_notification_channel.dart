import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Must match backend FCM `android.notification.channelId`.
const foodAppNotificationChannelId = 'foodapp_default';
const foodAppNotificationChannelName = 'FoodApp bildirishnomalar';

const foodAppAndroidNotificationChannel = AndroidNotificationChannel(
  foodAppNotificationChannelId,
  foodAppNotificationChannelName,
  description: 'Buyurtma va aksiya xabarlari',
  importance: Importance.max,
  playSound: true,
  enableVibration: true,
  showBadge: true,
);

const foodAppAndroidNotificationDetails = AndroidNotificationDetails(
  foodAppNotificationChannelId,
  foodAppNotificationChannelName,
  importance: Importance.max,
  priority: Priority.high,
  playSound: true,
  enableVibration: true,
  visibility: NotificationVisibility.public,
  category: AndroidNotificationCategory.message,
  ticker: 'FoodApp',
);
