import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../orders/data/courier_repository.dart';
import '../../../core/location/courier_location_service.dart';
import '../../../shared/models/courier_model.dart';
import '../../../shared/models/courier_order_model.dart';

final courierProfileProvider = FutureProvider.autoDispose<CourierProfileModel>((ref) async {
  ref.watch(authStateProvider);
  return ref.read(courierRepositoryProvider).fetchMe();
});

final activeOrderProvider = FutureProvider.autoDispose<CourierOrderModel?>((ref) async {
  ref.watch(authStateProvider);
  final orders = await ref.read(courierRepositoryProvider).fetchMyOrders();
  for (final order in orders) {
    if (order.isActive) return order;
  }
  return null;
});

final availableOrdersProvider =
    FutureProvider.autoDispose<List<CourierOrderModel>>((ref) async {
  ref.watch(authStateProvider);
  return ref.read(courierRepositoryProvider).fetchAvailableOrders();
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
    } catch (e, st) {
      state = AsyncValue.data(previous);
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }
}
