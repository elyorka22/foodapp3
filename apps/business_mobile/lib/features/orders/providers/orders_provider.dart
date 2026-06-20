import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../settings/data/settings_repository.dart';
import '../data/orders_repository.dart';
import '../../../shared/models/order_model.dart';

const _pollInterval = Duration(seconds: 15);

final orderFilterProvider = StateProvider<String?>((ref) => null);

final ordersPollingProvider = StreamProvider.autoDispose<List<StaffOrderModel>>((ref) async* {
  final filter = ref.watch(orderFilterProvider);

  while (true) {
    try {
      yield await ref.read(ordersRepositoryProvider).fetchOrders(
            statusGroup: filter,
          );
    } catch (_) {
      yield const [];
    }
    await Future<void>.delayed(_pollInterval);
  }
});

/// Incoming orders awaiting restaurant accept (PENDING only).
final newOrdersPollingProvider =
    StreamProvider.autoDispose<List<StaffOrderModel>>((ref) async* {
  while (true) {
    try {
      yield await ref.read(ordersRepositoryProvider).fetchOrders(
            statusGroup: 'pending',
          );
    } catch (_) {
      yield const [];
    }
    await Future<void>.delayed(_pollInterval);
  }
});

/// Accepted and completed orders (everything except PENDING).
final historyOrdersPollingProvider =
    StreamProvider.autoDispose<List<StaffOrderModel>>((ref) async* {
  while (true) {
    try {
      yield await ref.read(ordersRepositoryProvider).fetchOrders(
            statusGroup: 'history',
          );
    } catch (_) {
      yield const [];
    }
    await Future<void>.delayed(_pollInterval);
  }
});

final restaurantOrderProvider =
    FutureProvider.autoDispose.family<StaffOrderModel, String>((ref, orderId) async {
  return ref.read(ordersRepositoryProvider).fetchOrder(orderId);
});

final dispatchModeProvider = FutureProvider.autoDispose<String>((ref) async {
  return ref.read(settingsRepositoryProvider).fetchCourierDispatchMode();
});
