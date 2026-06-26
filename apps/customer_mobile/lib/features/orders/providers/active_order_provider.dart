import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/orders/order_status_steps.dart';
import '../../../core/storage/active_order_storage.dart';
import '../../../core/storage/storage_providers.dart';

final activeOrderStorageProvider = Provider<ActiveOrderStorage>((ref) {
  return ActiveOrderStorage(ref.watch(sharedPreferencesProvider));
});

class ActiveOrderNotifier extends Notifier<ActiveOrderRef?> {
  @override
  ActiveOrderRef? build() {
    return ref.read(activeOrderStorageProvider).load();
  }

  Future<void> setActive(String token, {String? orderNumber}) async {
    if (token.isEmpty) return;
    await ref.read(activeOrderStorageProvider).save(token, orderNumber: orderNumber);
    state = ActiveOrderRef(
      token: token,
      orderNumber: orderNumber,
      savedAt: DateTime.now().toUtc().toIso8601String(),
    );
  }

  Future<void> clearActive() async {
    await ref.read(activeOrderStorageProvider).clear();
    state = null;
  }

  void reload() {
    state = ref.read(activeOrderStorageProvider).load();
  }

  Future<void> syncFromOrderStatus(String status) async {
    if (OrderStatusSteps.isTerminal(status)) {
      await clearActive();
    }
  }
}

final activeOrderProvider =
    NotifierProvider<ActiveOrderNotifier, ActiveOrderRef?>(ActiveOrderNotifier.new);
