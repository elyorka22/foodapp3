import 'package:flutter_riverpod/flutter_riverpod.dart';

class NewJobAlert {
  const NewJobAlert({
    required this.orderId,
    required this.title,
    required this.fee,
  });

  final String orderId;
  final String title;
  final num fee;
}

final newJobAlertProvider = StateProvider<NewJobAlert?>((ref) => null);
