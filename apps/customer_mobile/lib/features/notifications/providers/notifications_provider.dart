import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../data/notifications_repository.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  return NotificationsRepository(ref.watch(dioProvider));
});

final notificationsListProvider = FutureProvider.autoDispose<List<NotificationItem>>((ref) {
  return ref.watch(notificationsRepositoryProvider).fetchList();
});

final notificationsUnreadProvider = FutureProvider.autoDispose<int>((ref) {
  return ref.watch(notificationsRepositoryProvider).fetchUnreadCount();
});
