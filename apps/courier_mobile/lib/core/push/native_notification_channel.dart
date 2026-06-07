import 'package:flutter_local_notifications/flutter_local_notifications.dart';

const foodAppNotificationChannelId = 'foodapp_default';
const foodAppNotificationChannelName = 'FoodApp kuryer';
const foodAppCourierUrgentChannelId = 'foodapp_courier_urgent';
const foodAppCourierUrgentChannelName = 'Shoshilinch buyurtmalar';

const foodAppAndroidNotificationChannel = AndroidNotificationChannel(
  foodAppNotificationChannelId,
  foodAppNotificationChannelName,
  description: 'Buyurtma va tizim xabarlari',
  importance: Importance.max,
  playSound: true,
  enableVibration: true,
  showBadge: true,
);

const foodAppCourierUrgentChannel = AndroidNotificationChannel(
  foodAppCourierUrgentChannelId,
  foodAppCourierUrgentChannelName,
  description: 'Yangi va tayinlangan buyurtmalar',
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

const foodAppCourierUrgentNotificationDetails = AndroidNotificationDetails(
  foodAppCourierUrgentChannelId,
  foodAppCourierUrgentChannelName,
  importance: Importance.max,
  priority: Priority.max,
  playSound: true,
  enableVibration: true,
  visibility: NotificationVisibility.public,
  category: AndroidNotificationCategory.call,
  fullScreenIntent: true,
  ticker: 'FoodApp — yangi buyurtma',
);
