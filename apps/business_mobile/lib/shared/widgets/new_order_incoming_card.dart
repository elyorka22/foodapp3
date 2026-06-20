import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/format_sum.dart';
import '../models/order_model.dart';
import 'app_card.dart';
import 'food_app_button.dart';

class NewOrderIncomingCard extends StatelessWidget {
  const NewOrderIncomingCard({
    super.key,
    required this.order,
    required this.onAccept,
    this.isLoading = false,
  });

  final StaffOrderModel order;
  final VoidCallback? onAccept;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.xl,
      ),
      child: Column(
        children: [
          Text(
            formatSum(order.itemsTotal),
            style: AppTypography.title.copyWith(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FoodAppButton(
              label: AppStrings.acceptOrder,
              compact: true,
              isLoading: isLoading,
              onPressed: isLoading ? null : onAccept,
            ),
          ),
        ],
      ),
    );
  }
}
