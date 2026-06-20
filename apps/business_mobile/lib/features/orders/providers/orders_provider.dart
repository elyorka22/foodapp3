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

/// New and in-progress restaurant orders before courier is called.
final openOrdersPollingProvider =
    StreamProvider.autoDispose<List<StaffOrderModel>>((ref) async* {
  while (true) {
    try {
      yield await ref.read(ordersRepositoryProvider).fetchOrders(
            statusGroup: 'open',
          );
    } catch (_) {
      yield const [];
    }
    await Future<void>.delayed(_pollInterval);
  }
});

/// Orders closed by restaurant after calling courier or reaching terminal status.
final closedOrdersPollingProvider =
    StreamProvider.autoDispose<List<StaffOrderModel>>((ref) async* {
  while (true) {
    try {
      yield await ref.read(ordersRepositoryProvider).fetchOrders(
            statusGroup: 'closed',
          );
    } catch (_) {
      yield const [];
    }
    await Future<void>.delayed(_pollInterval);
  }
});

@Deprecated('Use openOrdersPollingProvider')
final newOrdersPollingProvider = openOrdersPollingProvider;

@Deprecated('Use closedOrdersPollingProvider')
final historyOrdersPollingProvider = closedOrdersPollingProvider;

final restaurantOrderProvider =
    FutureProvider.autoDispose.family<StaffOrderModel, String>((ref, orderId) async {
  return ref.read(ordersRepositoryProvider).fetchOrder(orderId);
});

final dispatchModeProvider = FutureProvider.autoDispose<String>((ref) async {
  return ref.read(settingsRepositoryProvider).fetchCourierDispatchMode();
});
