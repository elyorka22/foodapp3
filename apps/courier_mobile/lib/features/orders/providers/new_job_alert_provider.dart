import 'package:flutter_riverpod/flutter_riverpod.dart';

class NewJobAlert {
  const NewJobAlert({
    required this.orderId,
    required this.title,
    required this.payAtRestaurant,
    required this.collectFromCustomer,
    required this.courierEarnings,
  });

  final String orderId;
  final String title;
  final num payAtRestaurant;
  final num collectFromCustomer;
  final num courierEarnings;
}

final newJobAlertProvider = StateProvider<NewJobAlert?>((ref) => null);
