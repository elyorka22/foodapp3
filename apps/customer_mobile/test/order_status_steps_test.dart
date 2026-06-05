import 'package:customer_mobile/core/orders/order_status_steps.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('activeIndex maps backend statuses to timeline', () {
    expect(OrderStatusSteps.activeIndex('PENDING'), 0);
    expect(OrderStatusSteps.activeIndex('ACCEPTED'), 1);
    expect(OrderStatusSteps.activeIndex('PREPARING'), 2);
    expect(OrderStatusSteps.activeIndex('COURIER_ASSIGNED'), 3);
    expect(OrderStatusSteps.activeIndex('ARRIVED_AT_RESTAURANT'), 4);
    expect(OrderStatusSteps.activeIndex('PICKED_UP'), 5);
    expect(OrderStatusSteps.activeIndex('DELIVERING'), 6);
    expect(OrderStatusSteps.activeIndex('DELIVERED'), 7);
    expect(OrderStatusSteps.activeIndex('CANCELLED'), -1);
  });
}
