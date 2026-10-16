import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:control_mobile/core/constants/api_paths.dart';
import 'package:control_mobile/features/orders/data/order_model.dart';
import 'package:control_mobile/shared/widgets/confirm_dialog.dart';
import 'package:control_mobile/shared/widgets/mutation_button.dart';

void main() {
  group('ApiPaths mutations', () {
    test('order mutation paths', () {
      expect(ApiPaths.orderStatus('o1'), '/orders/o1/status');
      expect(ApiPaths.orderAssignCourier('o1'), '/orders/o1/assign-courier');
      expect(ApiPaths.orderReassignCourier('o1'), '/orders/o1/reassign-courier');
      expect(ApiPaths.orderRemoveCourier('o1'), '/orders/o1/remove-courier');
      expect(ApiPaths.orderRequestCourier('o1'), '/orders/o1/request-courier');
    });

    test('restaurant and user mutation paths', () {
      expect(ApiPaths.restaurantApproval('r1'), '/restaurants/r1/approval');
      expect(ApiPaths.restaurantOwnerAccount('r1'), '/restaurants/r1/owner-account');
      expect(ApiPaths.user('u1'), '/users/u1');
      expect(ApiPaths.promoCode('p1'), '/promo-codes/p1');
      expect(ApiPaths.banner('b1'), '/banners/b1');
      expect(ApiPaths.pushSend, '/notifications/admin/push/send');
      expect(ApiPaths.settingsDeliveryPricing, '/settings/delivery-pricing');
    });
  });

  group('ControlOrder', () {
    test('parses courier and status from payload', () {
      final order = ControlOrder.fromJson({
        'id': 'oid',
        'orderNumber': 'A-1',
        'status': 'PREPARING',
        'total': 12000,
        'courier': {
          'id': 'cid',
          'user': {'fullName': 'Ali'},
        },
        'restaurant': {'name': 'Test Cafe'},
        'guestOrder': {'phone': '+998901112233'},
      });
      expect(order.id, 'oid');
      expect(order.status, 'PREPARING');
      expect(order.courierId, 'cid');
      expect(order.courierName, 'Ali');
      expect(order.businessName, 'Test Cafe');
      expect(ControlOrder.statusOptions, contains('DELIVERED'));
    });
  });

  group('shared manage widgets', () {
    testWidgets('MutationButton shows label and invokes onPressed', (tester) async {
      var pressed = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: MutationButton(
              label: 'Saqlash',
              onPressed: () => pressed = true,
            ),
          ),
        ),
      );
      expect(find.text('Saqlash'), findsOneWidget);
      await tester.tap(find.text('Saqlash'));
      expect(pressed, isTrue);
    });

    testWidgets('showConfirmDialog returns true on confirm', (tester) async {
      bool? result;
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              return Scaffold(
                body: TextButton(
                  onPressed: () async {
                    result = await showConfirmDialog(
                      context,
                      title: 'Title',
                      message: 'Message',
                    );
                  },
                  child: const Text('open'),
                ),
              );
            },
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();
      expect(find.text('Title'), findsOneWidget);
      await tester.tap(find.text('Tasdiqlash'));
      await tester.pumpAndSettle();
      expect(result, isTrue);
    });
  });
}
