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
    yield await ref.read(ordersRepositoryProvider).fetchOrders(
          statusGroup: filter,
        );
    await Future<void>.delayed(_pollInterval);
  }
});

/// All restaurant orders — filtered on the client for open/closed tabs.
final restaurantAllOrdersPollingProvider =
    StreamProvider.autoDispose<List<StaffOrderModel>>((ref) async* {
  while (true) {
    yield await ref.read(ordersRepositoryProvider).fetchOrders();
    await Future<void>.delayed(_pollInterval);
  }
});

final openOrdersPollingProvider =
    Provider.autoDispose<AsyncValue<List<StaffOrderModel>>>((ref) {
  return ref.watch(restaurantAllOrdersPollingProvider).whenData(
        (orders) => orders.where((o) => o.isOpenForRestaurant).toList(),
      );
});

final closedOrdersPollingProvider =
    Provider.autoDispose<AsyncValue<List<StaffOrderModel>>>((ref) {
  return ref.watch(restaurantAllOrdersPollingProvider).whenData(
        (orders) => orders.where((o) => o.isClosedForRestaurant).toList(),
      );
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
