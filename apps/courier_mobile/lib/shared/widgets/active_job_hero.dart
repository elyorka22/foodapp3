import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../models/courier_order_model.dart';
import 'job_compact_card.dart';

class ActiveJobHero extends StatelessWidget {
  const ActiveJobHero({
    super.key,
    required this.order,
    required this.onOpen,
  });

  final CourierOrderModel order;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return JobCompactCard(
      order: order,
      onTap: onOpen,
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.primary, size: 22),
    );
  }
}
