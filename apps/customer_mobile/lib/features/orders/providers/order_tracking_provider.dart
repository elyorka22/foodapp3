import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../checkout/data/orders_repository.dart';
import '../../../shared/models/order_track_model.dart';
import '../models/order_tracking_snapshot.dart';

/// Polls `GET /orders/track/:token` every 5s; retains last order on transient errors.
final orderTrackingProvider = StreamProvider.autoDispose
    .family<OrderTrackingSnapshot, String>((ref, trackingToken) async* {
  final repo = ref.watch(ordersRepositoryProvider);
  const interval = Duration(seconds: 5);
  OrderTrackModel? lastOrder;

  while (true) {
    try {
      final order = await repo.trackOrder(trackingToken);
      lastOrder = order;
      yield OrderTrackingSnapshot(order: order);
      if (_isTerminal(order.status)) break;
    } catch (e) {
      if (lastOrder != null) {
        yield OrderTrackingSnapshot(
          order: lastOrder,
          isStale: true,
          pollError: e.toString(),
        );
      } else {
        rethrow;
      }
    }
    await Future<void>.delayed(interval);
  }
});

bool _isTerminal(String status) =>
    status == 'DELIVERED' || status == 'CANCELLED';
