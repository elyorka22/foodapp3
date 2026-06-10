import 'package:flutter_test/flutter_test.dart';
import 'package:business_mobile/shared/models/auth_model.dart';
import 'package:business_mobile/shared/models/order_model.dart';

void main() {
  test('StaffOrderModel parses next status', () {
    final order = StaffOrderModel(
      id: '1',
      orderNumber: '100',
      status: 'PENDING',
      total: 50000,
    );
    expect(order.nextStatus, 'ACCEPTED');
    expect(order.canRequestCourier, false);
  });

  test('AuthUserModel routes by role', () {
    const restaurant = AuthUserModel(
      id: '1',
      fullName: 'Owner',
      role: 'BUSINESS',
    );
    const manager = AuthUserModel(
      id: '2',
      fullName: 'Manager',
      role: 'MANAGER',
    );
    expect(restaurant.isRestaurant, true);
    expect(manager.isManager, true);
    expect(restaurant.homeRoute, '/restaurant');
    expect(manager.homeRoute, '/manager');
  });
}
