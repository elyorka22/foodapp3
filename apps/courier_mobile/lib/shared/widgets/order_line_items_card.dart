import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/courier_order_model.dart';
import 'food_app_card.dart';

class OrderLineItemsCard extends StatelessWidget {
  const OrderLineItemsCard({super.key, required this.items});

  final List<CourierOrderLineItem> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return FoodAppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(AppStrings.orderItems, style: AppTypography.subtitle),
          const SizedBox(height: AppSpacing.md),
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${item.quantity}×',
                    style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(item.name, style: AppTypography.body),
                  ),
                  Text(formatSum(item.subtotal), style: AppTypography.bodySmall),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
