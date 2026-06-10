import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/order_model.dart';
import '../data/orders_repository.dart';

final ordersListProvider = FutureProvider.autoDispose<List<StaffOrderModel>>((ref) async {
  return ref.watch(ordersRepositoryProvider).fetchOrders();
});

final ordersPollingProvider = StreamProvider.autoDispose<List<StaffOrderModel>>((ref) async* {
  final repo = ref.watch(ordersRepositoryProvider);
  while (true) {
    yield await repo.fetchOrders();
    await Future<void>.delayed(const Duration(seconds: 15));
  }
});
