import 'package:courier_mobile/features/home/providers/courier_home_provider.dart';
import 'package:courier_mobile/shared/models/courier_order_model.dart';
import 'package:flutter_test/flutter_test.dart';

CourierOrderModel _order({
  required String id,
  String status = 'PREPARING',
  String? inboxKind,
}) {
  return CourierOrderModel(
    id: id,
    orderNumber: id,
    status: status,
    subtotal: 95000,
    deliveryFee: 6500,
    discountAmount: 0,
    total: 101500,
    inboxKind: inboxKind,
  );
}

void main() {
  test('syncPushInboxWithApi drops stale push-only offer after delivery', () {
    final stalePush = [_order(id: 'a1', inboxKind: 'accept')];
    final synced = syncPushInboxWithApi(stalePush, const []);

    expect(synced, isEmpty);
    expect(mergeInboxOrders(const [], synced), isEmpty);
  });

  test('syncPushInboxWithApi keeps push row while API still lists it', () {
    final push = [_order(id: 'a1', inboxKind: 'accept')];
    final fromApi = [_order(id: 'a1', inboxKind: 'accept')];

    final synced = syncPushInboxWithApi(push, fromApi);
    final merged = mergeInboxOrders(fromApi, synced);

    expect(merged.length, 1);
    expect(merged.first.id, 'a1');
  });

  test('mergeInboxOrders prefers fresh API row over stale push metadata', () {
    final stalePush = _order(id: 'a1', status: 'PREPARING', inboxKind: 'accept');
    final fromApi = [_order(id: 'a1', status: 'DELIVERING', inboxKind: 'continue')];

    final merged = mergeInboxOrders(fromApi, [stalePush]);

    expect(merged.length, 1);
    expect(merged.first.status, 'DELIVERING');
    expect(merged.first.inboxKind, 'continue');
  });
}
