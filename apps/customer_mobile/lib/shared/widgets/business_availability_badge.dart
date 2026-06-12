import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Open/closed badge for restaurants and stores.
class BusinessAvailabilityBadge extends StatelessWidget {
  const BusinessAvailabilityBadge({
    super.key,
    required this.isOpen,
    this.closesAt,
    this.closingSoon = false,
    this.compact = false,
    this.onDarkBackground = false,
  });

  final bool? isOpen;
  final String? closesAt;
  final bool closingSoon;
  final bool compact;
  final bool onDarkBackground;

  @override
  Widget build(BuildContext context) {
    if (isOpen == null) return const SizedBox.shrink();

    final open = isOpen!;
    final showClosing = open && closingSoon && closesAt != null && closesAt!.isNotEmpty;

    if (showClosing) {
      return _BadgeRow(
        compact: compact,
        onDarkBackground: onDarkBackground,
        dotColor: const Color(0xFFFBBF24),
        label: AppStrings.open,
        suffix: AppStrings.closesAt(closesAt!),
        suffixColor: onDarkBackground ? const Color(0xFFFDE68A) : const Color(0xFFB45309),
      );
    }

    return _BadgeRow(
      compact: compact,
      onDarkBackground: onDarkBackground,
      dotColor: open
          ? (onDarkBackground ? const Color(0xFF4ADE80) : AppColors.success)
          : (onDarkBackground ? const Color(0xFFD1D5DB) : AppColors.textSecondary),
      label: open ? AppStrings.open : AppStrings.closed,
    );
  }
}

class _BadgeRow extends StatelessWidget {
  const _BadgeRow({
    required this.compact,
    required this.onDarkBackground,
    required this.dotColor,
    required this.label,
    this.suffix,
    this.suffixColor,
  });

  final bool compact;
  final bool onDarkBackground;
  final Color dotColor;
  final String label;
  final String? suffix;
  final Color? suffixColor;

  @override
  Widget build(BuildContext context) {
    final fontSize = compact ? 12.0 : 13.0;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: AppTypography.caption.copyWith(
            fontSize: fontSize,
            fontWeight: FontWeight.w600,
            color: onDarkBackground
                ? Colors.white
                : (dotColor == AppColors.textSecondary
                    ? AppColors.textSecondary
                    : AppColors.textPrimary),
          ),
        ),
        if (suffix != null) ...[
          Text(
            ' · ',
            style: AppTypography.caption.copyWith(
              fontSize: fontSize,
              color: onDarkBackground ? Colors.white70 : null,
            ),
          ),
          Flexible(
            child: Text(
              suffix!,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.caption.copyWith(
                fontSize: fontSize,
                color: suffixColor ?? AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// Banner for detail pages (closed or closing soon).
class BusinessAvailabilityBanner extends StatelessWidget {
  const BusinessAvailabilityBanner({
    super.key,
    required this.isOpen,
    this.closesAt,
    this.closingSoon = false,
  });

  final bool? isOpen;
  final String? closesAt;
  final bool closingSoon;

  @override
  Widget build(BuildContext context) {
    if (isOpen == null) return const SizedBox.shrink();

    final open = isOpen!;
    final showClosing = open && closingSoon && closesAt != null && closesAt!.isNotEmpty;

    if (open && !showClosing) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFECFDF5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const BusinessAvailabilityBadge(
          isOpen: true,
          compact: true,
        ),
      );
    }

    final message = showClosing
        ? '${AppStrings.open} · ${AppStrings.closesAt(closesAt!)}'
        : AppStrings.restaurantClosed;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        message,
        style: AppTypography.bodySmall.copyWith(color: const Color(0xFF92400E)),
      ),
    );
  }
}
