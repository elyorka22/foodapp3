import 'package:flutter_test/flutter_test.dart';
import 'package:control_mobile/core/utils/format_uz.dart';
import 'package:control_mobile/features/dashboard/data/dashboard_model.dart';

void main() {
  test('DashboardMetrics.fromJson maps analytics payload', () {
    final m = DashboardMetrics.fromJson({
      'todayOrders': 12,
      'pendingOrders': 3,
      'deliveredOrders': 8,
      'cancelledOrders': 1,
      'revenueToday': 250000,
      'revenueMonth': 4100000,
      'activeCouriers': 5,
      'activeRestaurants': 9,
      'activeStores': 2,
      'recentOrders': [
        {
          'id': 'o1',
          'orderNumber': 'A-100',
          'status': 'PENDING',
          'total': 45000,
          'createdAt': '2026-10-16T12:00:00.000Z',
          'business': {'name': 'Test Cafe'},
        },
      ],
    });
    expect(m.todayOrders, 12);
    expect(m.revenueToday, 250000);
    expect(m.recentOrders, hasLength(1));
    expect(m.recentOrders.first.businessName, 'Test Cafe');
    expect(m.recentOrders.first.orderNumber, 'A-100');
  });

  test('formatMoney spaces thousands', () {
    expect(formatMoney(35000), "35 000 so'm");
    expect(formatMoney(0), "0 so'm");
  });
}
