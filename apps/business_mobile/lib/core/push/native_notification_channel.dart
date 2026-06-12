import 'package:flutter_local_notifications/flutter_local_notifications.dart';

const foodAppNotificationChannelId = 'foodapp_business_default';
const foodAppNotificationChannelName = 'FoodApp Business';
const foodAppBusinessUrgentChannelId = 'foodapp_business_urgent';
const foodAppBusinessUrgentChannelName = 'Yangi buyurtmalar';

const foodAppAndroidNotificationChannel = AndroidNotificationChannel(
  foodAppNotificationChannelId,
  foodAppNotificationChannelName,
  description: 'Buyurtma va tizim xabarlari',
  importance: Importance.max,
  playSound: true,
  enableVibration: true,
  showBadge: true,
);

const foodAppBusinessUrgentChannel = AndroidNotificationChannel(
  foodAppBusinessUrgentChannelId,
  foodAppBusinessUrgentChannelName,
  description: 'Yangi buyurtmalar',
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
  ticker: 'FoodApp Business',
);

const foodAppBusinessUrgentNotificationDetails = AndroidNotificationDetails(
  foodAppBusinessUrgentChannelId,
  foodAppBusinessUrgentChannelName,
  importance: Importance.max,
  priority: Priority.max,
  playSound: true,
  enableVibration: true,
  visibility: NotificationVisibility.public,
  category: AndroidNotificationCategory.call,
  ticker: 'FoodApp — yangi buyurtma',
);
