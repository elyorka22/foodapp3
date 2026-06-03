/// Customer-facing order timeline (maps backend `OrderStatus`).
abstract final class OrderStatusSteps {
  static const steps = [
    OrderStep(id: 'received', backendStatuses: ['PENDING'], label: 'Buyurtma qabul qilindi'),
    OrderStep(id: 'accepted', backendStatuses: ['ACCEPTED'], label: 'Tasdiqlandi'),
    OrderStep(id: 'preparing', backendStatuses: ['PREPARING'], label: 'Tayyorlanmoqda'),
    OrderStep(
      id: 'ready',
      backendStatuses: ['COURIER_ASSIGNED', 'PICKED_UP'],
      label: 'Tayyor',
    ),
    OrderStep(id: 'delivering', backendStatuses: ['DELIVERING'], label: "Yo'lda"),
    OrderStep(id: 'completed', backendStatuses: ['DELIVERED'], label: 'Yetkazildi'),
  ];

  static int activeIndex(String status) {
    if (status == 'CANCELLED') return -1;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].backendStatuses.contains(status)) return i;
    }
    // In-progress between defined states
    const order = [
      'PENDING',
      'ACCEPTED',
      'PREPARING',
      'COURIER_ASSIGNED',
      'PICKED_UP',
      'DELIVERING',
      'DELIVERED',
    ];
    final idx = order.indexOf(status);
    if (idx < 0) return 0;
    if (idx <= 0) return 0;
    if (idx <= 1) return 1;
    if (idx <= 2) return 2;
    if (idx <= 4) return 3;
    if (idx == 5) return 4;
    return 5;
  }

  static bool isTerminal(String status) =>
      status == 'DELIVERED' || status == 'CANCELLED';
}

class OrderStep {
  const OrderStep({
    required this.id,
    required this.backendStatuses,
    required this.label,
  });

  final String id;
  final List<String> backendStatuses;
  final String label;
}
