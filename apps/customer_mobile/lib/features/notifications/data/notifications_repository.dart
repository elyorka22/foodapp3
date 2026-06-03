import 'package:dio/dio.dart';
import '../../../core/constants/api_paths.dart';

class NotificationItem {
  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    required this.createdAt,
    this.metadata,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String,
      isRead: json['isRead'] as bool? ?? false,
      createdAt: json['createdAt'] as String,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  final String id;
  final String title;
  final String body;
  final String type;
  final bool isRead;
  final String createdAt;
  final Map<String, dynamic>? metadata;
}

class NotificationsRepository {
  NotificationsRepository(this._dio);

  final Dio _dio;

  Future<List<NotificationItem>> fetchList({int limit = 50}) async {
    final res = await _dio.get<List<dynamic>>(
      ApiPaths.notifications,
      queryParameters: {'limit': limit},
    );
    final data = res.data ?? [];
    return data
        .map((e) => NotificationItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<int> fetchUnreadCount() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.notificationsUnread);
    return (res.data?['count'] as num?)?.toInt() ?? 0;
  }

  Future<void> markRead(String id) async {
    await _dio.patch<void>(ApiPaths.notificationRead(id));
  }

  Future<void> markAllRead() async {
    await _dio.post<void>(ApiPaths.notificationsReadAll);
  }
}
