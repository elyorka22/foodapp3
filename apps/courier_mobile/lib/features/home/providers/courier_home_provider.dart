import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../notifications/data/notifications_repository.dart';
import '../../orders/data/courier_repository.dart';
import '../../../core/location/courier_location_service.dart';
import '../../../shared/models/courier_earnings_model.dart';
import '../../../shared/models/courier_shift_stats_model.dart';
import '../../../shared/models/courier_model.dart';
import '../../../shared/models/courier_order_model.dart';

const _pollInterval = Duration(seconds: 5);

final courierProfileProvider = FutureProvider.autoDispose<CourierProfileModel>((ref) async {
  ref.watch(authStateProvider);
  return ref.read(courierRepositoryProvider).fetchMe();
});

final courierEarningsProvider =
    FutureProvider.autoDispose<CourierEarningsModel>((ref) async {
  ref.watch(authStateProvider);
  return ref.read(courierRepositoryProvider).fetchEarnings();
});

final shiftStatsProvider = StreamProvider.autoDispose<CourierShiftStatsModel>((ref) async* {
  ref.watch(authStateProvider);
  while (true) {
    try {
      yield await ref.read(courierRepositoryProvider).fetchShiftStats();
    } catch (_) {
      yield const CourierShiftStatsModel(
        todayDeliveries: 0,
        todayEarnings: 0,
        totalDeliveries: 0,
        totalEarnings: 0,
      );
    }
    await Future<void>.delayed(_pollInterval);
  }
});

final notificationsUnreadProvider = FutureProvider.autoDispose<int>((ref) async {
  ref.watch(authStateProvider);
  return ref.read(notificationsRepositoryProvider).fetchUnreadCount();
});

final activeOrderProvider = StreamProvider.autoDispose<CourierOrderModel?>((ref) async* {
  ref.watch(authStateProvider);
  while (true) {
    try {
      final orders = await ref.read(courierRepositoryProvider).fetchMyOrders();
      CourierOrderModel? active;
      for (final order in orders) {
        if (order.isActive) {
          active = order;
          break;
        }
      }
      yield active;
    } catch (_) {
      yield null;
    }
    await Future<void>.delayed(_pollInterval);
  }
});

final availableOrdersProvider =
    StreamProvider.autoDispose<List<CourierOrderModel>>((ref) async* {
  ref.watch(authStateProvider);
  final online = ref.watch(courierOnlineProvider).valueOrNull ?? false;
  if (!online) {
    yield [];
    return;
  }

  while (true) {
    try {
      yield await ref.read(courierRepositoryProvider).fetchAvailableOrders();
    } catch (_) {
      yield [];
    }
    await Future<void>.delayed(_pollInterval);
  }
});

final courierOnlineProvider =
    NotifierProvider<CourierOnlineNotifier, AsyncValue<bool>>(CourierOnlineNotifier.new);

class CourierOnlineNotifier extends Notifier<AsyncValue<bool>> {
  @override
  AsyncValue<bool> build() => const AsyncValue.loading();

  Future<void> load() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final profile = await ref.read(courierRepositoryProvider).fetchMe();
      return profile.isOnline;
    });
  }

  Future<void> setOnline(bool value) async {
    final previous = state.valueOrNull ?? false;
    state = AsyncValue.data(value);
    try {
      await ref.read(courierRepositoryProvider).setOnline(value);
      if (value) {
        final pos = await CourierLocationService().getCurrentPosition();
        if (pos != null) {
          await ref.read(courierRepositoryProvider).updateLocation(
                pos.latitude,
                pos.longitude,
              );
        }
      }
      ref.invalidate(courierProfileProvider);
      ref.invalidate(courierEarningsProvider);
      if (!value) {
        ref.invalidate(availableOrdersProvider);
      }
    } catch (e, st) {
      state = AsyncValue.data(previous);
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }
}
