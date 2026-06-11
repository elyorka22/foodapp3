import 'package:customer_mobile/core/orders/order_status_steps.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('activeIndex maps backend statuses to 3-stage timeline', () {
    expect(OrderStatusSteps.steps.length, 3);
    expect(OrderStatusSteps.activeIndex('PENDING'), 0);
    expect(OrderStatusSteps.activeIndex('ACCEPTED'), 0);
    expect(OrderStatusSteps.activeIndex('PREPARING'), 0);
    expect(OrderStatusSteps.activeIndex('COURIER_ASSIGNED'), 1);
    expect(OrderStatusSteps.activeIndex('ARRIVED_AT_RESTAURANT'), 1);
    expect(OrderStatusSteps.activeIndex('PICKED_UP'), 1);
    expect(OrderStatusSteps.activeIndex('DELIVERING'), 1);
    expect(OrderStatusSteps.activeIndex('DELIVERED'), 3);
    expect(OrderStatusSteps.activeIndex('CANCELLED'), -1);
  });
}
