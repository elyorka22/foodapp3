import 'dart:async';

import 'package:flutter/foundation.dart';
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

/// Orders loaded from push before API inbox catches up.
final pushInboxOrdersProvider = StateProvider<List<CourierOrderModel>>((ref) => []);

/// Align local shift UI with backend `isOnline` (e.g. after app restart while still on shift).
void syncShiftSessionFromBackend(WidgetRef ref) {
  final isOnline = ref.read(courierOnlineProvider).valueOrNull ?? false;
  if (isOnline) {
    ref.read(shiftSessionOpenProvider.notifier).state = true;
  }
}

void removePushInboxOrder(WidgetRef ref, String orderId) {
  ref.read(pushInboxOrdersProvider.notifier).state = ref
      .read(pushInboxOrdersProvider)
      .where((item) => item.id != orderId)
      .toList();
}

List<CourierOrderModel> mergeInboxOrders(
  List<CourierOrderModel> fromApi,
  List<CourierOrderModel> fromPush,
) {
  final seen = <String>{};
  final merged = <CourierOrderModel>[];
  final byApi = {for (final order in fromApi) order.id: order};

  for (final order in fromApi) {
    if (order.isCancelled || order.isDelivered) continue;
    if (seen.add(order.id)) merged.add(order);
  }

  for (final order in fromPush) {
    if (order.isCancelled || order.isDelivered) continue;
    if (seen.contains(order.id)) continue;
    if (!order.isPendingOffer) continue;
    seen.add(order.id);
    merged.add(byApi[order.id] ?? order);
  }

  merged.sort((a, b) {
    final byKind = (a.isPendingOffer ? 0 : 1).compareTo(b.isPendingOffer ? 0 : 1);
    if (byKind != 0) return byKind;
    return (b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0))
        .compareTo(a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0));
  });

  return merged;
}

void _reconcilePushInbox(Ref ref, List<CourierOrderModel> fromApi) {
  final byApi = {for (final order in fromApi) order.id: order};
  final next = ref
      .read(pushInboxOrdersProvider)
      .where((order) => !order.isCancelled && !order.isDelivered)
      .map((order) => byApi[order.id] ?? order)
      .where((order) {
        final fresh = byApi[order.id];
        if (fresh != null) return fresh.isPendingOffer || fresh.isOngoingJob;
        return order.isPendingOffer;
      })
      .toList();

  final current = ref.read(pushInboxOrdersProvider);
  if (current.length == next.length &&
      current.every((order) => next.any((item) => item.id == order.id))) {
    return;
  }
  ref.read(pushInboxOrdersProvider.notifier).state = next;
}

Future<CourierOrderModel?> _resolveOrderForPush(WidgetRef ref, String orderId) async {
  try {
    for (final order in await ref.read(courierRepositoryProvider).fetchHomeInbox()) {
      if (order.id == orderId) return order;
    }
  } catch (_) {}

  try {
    final order = await ref.read(courierRepositoryProvider).fetchOrder(orderId);
    if (!order.isCancelled) return order;
  } catch (_) {}

  return null;
}

void _rememberPushOrder(WidgetRef ref, CourierOrderModel order) {
  if (order.isCancelled || order.isDelivered || !order.isPendingOffer) return;

  final current = ref.read(pushInboxOrdersProvider);
  if (current.any((item) => item.id == order.id)) return;
  ref.read(pushInboxOrdersProvider.notifier).state = [...current, order];
}

/// Refresh lists and show in-app banner when a push about a new order arrives.
Future<void> handleOrderPush(
  WidgetRef ref,
  String orderId, {
  String? orderNumber,
}) async {
  syncShiftSessionFromBackend(ref);
  ref.invalidate(homeInboxProvider);
  ref.invalidate(activeOrderProvider);

  var order = await _resolveOrderForPush(ref, orderId);
  order ??= CourierOrderModel.fromPush(orderId: orderId, orderNumber: orderNumber);

  if (order.isCancelled || order.isDelivered) {
    removePushInboxOrder(ref, orderId);
    return;
  }

  _rememberPushOrder(ref, order);
  ref.read(newJobAlertProvider.notifier).state = NewJobAlert(
    orderId: order.id,
    title: order.restaurantName ?? order.orderNumber,
    payAtRestaurant: order.orderAmount,
    collectFromCustomer: order.collectFromCustomer,
    courierEarnings: order.courierEarnings,
  );
}

bool _shouldPollOrders(Ref ref) {
  return ref.watch(authStateProvider).valueOrNull != null;
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

/// Current in-progress delivery (blocks ending shift).
final activeOrderProvider = StreamProvider.autoDispose<CourierOrderModel?>((ref) async* {
  ref.watch(authStateProvider);
  if (!_shouldPollOrders(ref)) {
    yield null;
    return;
  }

  while (true) {
    try {
      final orders = await ref.read(courierRepositoryProvider).fetchHomeInbox();
      CourierOrderModel? active;
      for (final order in orders) {
        if (order.isActiveJob) {
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

/// Home screen list: pending offers + ongoing deliveries.
final homeInboxProvider =
    StreamProvider.autoDispose<List<CourierOrderModel>>((ref) async* {
  ref.watch(authStateProvider);
  if (!_shouldPollOrders(ref)) {
    yield [];
    return;
  }

  while (true) {
    try {
      final fromApi = await ref.read(courierRepositoryProvider).fetchHomeInbox();
      _reconcilePushInbox(ref, fromApi);
      final pushed = ref.read(pushInboxOrdersProvider);
      yield mergeInboxOrders(fromApi, pushed);
    } catch (e, st) {
      debugPrint('[homeInboxProvider] fetch failed: $e\n$st');
      final pushed = ref.read(pushInboxOrdersProvider);
      final fallback = pushed.where((order) => order.isPendingOffer || order.isOngoingJob).toList();
      if (fallback.isNotEmpty) {
        yield fallback;
      } else {
        rethrow;
      }
    }
    await Future<void>.delayed(_pollInterval);
  }
});

/// Alias kept for existing listeners (sound alert, bottom sheet panel).
final availableOrdersProvider = homeInboxProvider;

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
        ref.invalidate(homeInboxProvider);
      }
    } catch (e, st) {
      state = AsyncValue.data(previous);
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }
}
