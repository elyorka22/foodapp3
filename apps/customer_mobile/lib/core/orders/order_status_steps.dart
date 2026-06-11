/// Customer-facing order timeline — 3 stages only.
abstract final class OrderStatusSteps {
  static const steps = [
    OrderStep(
      id: 'establishment',
      backendStatuses: ['PENDING', 'ACCEPTED', 'PREPARING'],
      label: 'Restoran',
      iconName: 'store',
    ),
    OrderStep(
      id: 'courier',
      backendStatuses: [
        'COURIER_ASSIGNED',
        'ARRIVED_AT_RESTAURANT',
        'PICKED_UP',
        'DELIVERING',
      ],
      label: 'Kuryer',
      iconName: 'delivery',
    ),
    OrderStep(
      id: 'client',
      backendStatuses: ['DELIVERED'],
      label: 'Yetkazildi',
      iconName: 'home',
    ),
  ];

  static int activeIndex(String status) {
    if (status == 'CANCELLED') return -1;
    if (status == 'DELIVERED') return steps.length;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].backendStatuses.contains(status)) return i;
    }
    return 0;
  }

  static String? statusHint(String status) {
    return switch (status) {
      'PENDING' => 'Buyurtma qabul qilindi',
      'ACCEPTED' => 'Tasdiqlandi',
      'PREPARING' => 'Tayyorlanmoqda',
      'COURIER_ASSIGNED' => 'Kuryer biriktirildi',
      'ARRIVED_AT_RESTAURANT' => 'Kuryer restoranda',
      'PICKED_UP' => 'Buyurtma olib ketildi',
      'DELIVERING' => "Yo'lda",
      'DELIVERED' => 'Yetkazildi',
      _ => null,
    };
  }

  static bool isTerminal(String status) =>
      status == 'DELIVERED' || status == 'CANCELLED';
}

class OrderStep {
  const OrderStep({
    required this.id,
    required this.backendStatuses,
    required this.label,
    required this.iconName,
  });

  final String id;
  final List<String> backendStatuses;
  final String label;
  final String iconName;
}
