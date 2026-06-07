import 'package:flutter_local_notifications/flutter_local_notifications.dart';

const foodAppNotificationChannelId = 'foodapp_default';
const foodAppNotificationChannelName = 'FoodApp kuryer';

const foodAppAndroidNotificationChannel = AndroidNotificationChannel(
  foodAppNotificationChannelId,
  foodAppNotificationChannelName,
  description: 'Buyurtma va tizim xabarlari',
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
  ticker: 'FoodApp Courier',
);
