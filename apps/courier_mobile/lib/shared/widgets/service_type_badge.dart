import 'package:flutter/material.dart';
import '../../core/jobs/job_service_type.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_typography.dart';

class ServiceTypeBadge extends StatelessWidget {
  const ServiceTypeBadge({
    super.key,
    required this.type,
    this.compact = false,
  });

  final JobServiceType type;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: type.color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: type.color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(type.icon, size: compact ? 12 : 14, color: type.color),
          const SizedBox(width: 4),
          Text(
            type.label,
            style: AppTypography.caption.copyWith(
              color: type.color,
              fontWeight: FontWeight.w700,
              fontSize: compact ? 10 : 11,
            ),
          ),
          if (!type.isAvailable) ...[
            const SizedBox(width: 4),
            Text(
              AppStrings.serviceComingSoon,
              style: AppTypography.caption.copyWith(
                color: type.color.withValues(alpha: 0.7),
                fontSize: 9,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
