import '../../../shared/models/order_track_model.dart';

/// Order tracking poll state — keeps last good order when network blips.
class OrderTrackingSnapshot {
  const OrderTrackingSnapshot({
    required this.order,
    this.isStale = false,
    this.pollError,
  });

  final OrderTrackModel order;
  final bool isStale;
  final String? pollError;
}
