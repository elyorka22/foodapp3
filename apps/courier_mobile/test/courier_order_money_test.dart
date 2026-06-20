import 'package:courier_mobile/shared/models/courier_order_model.dart';
import 'package:flutter_test/flutter_test.dart';

CourierOrderModel _order({
  num subtotal = 100000,
  num deliveryFee = 10000,
  num discountAmount = 0,
  num total = 110000,
  num? estimatedCourierFee,
}) {
  return CourierOrderModel.fromJson({
    'id': '1',
    'orderNumber': 'ORD-1',
    'status': 'PREPARING',
    'subtotal': subtotal,
    'deliveryFee': deliveryFee,
    'discountAmount': discountAmount,
    'total': total,
    if (estimatedCourierFee != null) 'estimatedCourierFee': estimatedCourierFee,
  });
}

void main() {
  test('orderAmount uses net food total after discount', () {
    final order = _order(
      subtotal: 100000,
      discountAmount: 20000,
      deliveryFee: 10000,
      total: 90000,
    );
    expect(order.orderAmount, 80000);
    expect(order.collectFromCustomer, 90000);
    expect(order.customerDeliveryFee, 10000);
  });

  test('courierEarnings uses customer delivery fee from checkout', () {
    final order = _order(
      deliveryFee: 10000,
      estimatedCourierFee: 5000,
    );
    expect(order.courierEarnings, 10000);
    expect(order.customerDeliveryFee, 10000);
  });
}
