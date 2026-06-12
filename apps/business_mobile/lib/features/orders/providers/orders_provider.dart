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

final dispatchModeProvider = FutureProvider.autoDispose<String>((ref) async {
  return ref.read(settingsRepositoryProvider).fetchCourierDispatchMode();
});
