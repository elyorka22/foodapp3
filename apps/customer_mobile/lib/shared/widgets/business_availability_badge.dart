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

/// Status card for restaurant / store detail pages.
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
    final showClosing =
        open && closingSoon && closesAt != null && closesAt!.trim().isNotEmpty;

    if (showClosing) {
      return _StatusCard(
        icon: Icons.schedule_rounded,
        iconColor: const Color(0xFFD97706),
        iconBackground: const Color(0xFFFEF3C7),
        borderColor: const Color(0xFFFDE68A),
        backgroundColor: const Color(0xFFFFFBEB),
        title: AppStrings.closingSoonTitle,
        subtitle: AppStrings.closesAt(closesAt!),
        titleColor: const Color(0xFF92400E),
        subtitleColor: const Color(0xFFB45309),
      );
    }

    if (open) {
      return const _StatusCard(
        icon: Icons.check_circle_rounded,
        iconColor: AppColors.success,
        iconBackground: Color(0xFFDCFCE7),
        borderColor: Color(0xFFBBF7D0),
        backgroundColor: Color(0xFFF0FDF4),
        title: AppStrings.open,
        subtitle: AppStrings.openNowHint,
        titleColor: Color(0xFF166534),
        subtitleColor: Color(0xFF15803D),
      );
    }

    return const _StatusCard(
      icon: Icons.storefront_outlined,
      iconColor: Color(0xFF6B7280),
      iconBackground: Color(0xFFF3F4F6),
      borderColor: Color(0xFFE5E7EB),
      backgroundColor: AppColors.surface,
      title: AppStrings.closed,
      subtitle: AppStrings.closedHint,
      titleColor: AppColors.textPrimary,
      subtitleColor: AppColors.textSecondary,
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.borderColor,
    required this.backgroundColor,
    required this.title,
    required this.subtitle,
    required this.titleColor,
    required this.subtitleColor,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final Color borderColor;
  final Color backgroundColor;
  final String title;
  final String subtitle;
  final Color titleColor;
  final Color subtitleColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 22, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.subtitle.copyWith(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: AppTypography.caption.copyWith(
                    fontSize: 13,
                    color: subtitleColor,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
