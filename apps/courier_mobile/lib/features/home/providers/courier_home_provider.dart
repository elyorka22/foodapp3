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

import '../../orders/providers/new_job_alert_provider.dart';

const _pollInterval = Duration(seconds: 5);

/// True only after courier taps "Start shift" in current app session.
final shiftSessionOpenProvider = StateProvider<bool>((ref) => false);

/// Align local shift UI with backend `isOnline` (e.g. after app restart while still on shift).
void syncShiftSessionFromBackend(WidgetRef ref) {
  final isOnline = ref.read(courierOnlineProvider).valueOrNull ?? false;
  if (isOnline) {
    ref.read(shiftSessionOpenProvider.notifier).state = true;
  }
}

/// Refresh lists and show in-app banner when a push about a new order arrives.
Future<void> handleOrderPush(WidgetRef ref, String orderId) async {
  syncShiftSessionFromBackend(ref);
  ref.invalidate(availableOrdersProvider);
  ref.invalidate(activeOrderProvider);

  try {
    final order = await ref.read(courierRepositoryProvider).fetchOrder(orderId);
    if (order.isCancelled) return;
    ref.read(newJobAlertProvider.notifier).state = NewJobAlert(
      orderId: order.id,
      title: order.restaurantName ?? order.orderNumber,
      payAtRestaurant: order.orderAmount,
      collectFromCustomer: order.collectFromCustomer,
      courierEarnings: order.courierEarnings,
    );
  } catch (_) {
    ref.read(newJobAlertProvider.notifier).state = NewJobAlert(
      orderId: orderId,
      title: orderId,
      payAtRestaurant: 0,
      collectFromCustomer: 0,
      courierEarnings: 0,
    );
  }
}

bool _shouldPollOrders(Ref ref) {
  if (ref.watch(shiftSessionOpenProvider)) return true;
  return ref.watch(courierOnlineProvider).valueOrNull ?? false;
}

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
        todayBonuses: 0,
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
  if (!_shouldPollOrders(ref)) {
    yield null;
    return;
  }

  while (true) {
    try {
      final orders = await ref
          .read(courierRepositoryProvider)
          .fetchMyOrders(statusGroup: 'active');
      CourierOrderModel? active;
      for (final order in orders) {
        if (order.isActive &&
            !order.isDelivered &&
            !order.isCancelled &&
            !order.needsCourierAcceptance) {
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
  if (!_shouldPollOrders(ref)) {
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
    if (state.hasError) {
      state = const AsyncValue.data(false);
    }
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
