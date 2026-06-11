import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../models/courier_order_model.dart';
import 'job_compact_card.dart';

class JobOfferCard extends StatelessWidget {
  const JobOfferCard({
    super.key,
    required this.order,
    required this.onAccept,
    this.isLoading = false,
  });

  final CourierOrderModel order;
  final VoidCallback? onAccept;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return JobCompactCard(
      order: order,
      onTap: isLoading ? null : onAccept,
      trailing: SizedBox(
        height: 32,
        child: FilledButton(
          onPressed: isLoading ? null : onAccept,
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: isLoading
              ? const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.onPrimary,
                  ),
                )
              : Text(
                  AppStrings.accept,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.onPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
      ),
    );
  }
}
