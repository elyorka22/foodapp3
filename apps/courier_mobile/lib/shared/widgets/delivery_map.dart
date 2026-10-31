import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/map_launcher.dart';

/// Navigation panel instead of an embedded map — opens Yandex or Google Maps.
class DeliveryMap extends StatelessWidget {
  const DeliveryMap({
    super.key,
    this.courierLat,
    this.courierLng,
    this.restaurantLat,
    this.restaurantLng,
    this.customerLat,
    this.customerLng,
    this.orderStatus,
    this.expanded = false,
    this.showNavButtons = true,
  });

  final double? courierLat;
  final double? courierLng;
  final double? restaurantLat;
  final double? restaurantLng;
  final double? customerLat;
  final double? customerLng;
  final String? orderStatus;
  final bool expanded;
  final bool showNavButtons;

  bool get _toCustomer {
    final status = orderStatus;
    return status == 'PICKED_UP' || status == 'DELIVERING';
  }

  double? get _destLat => _toCustomer ? customerLat : restaurantLat;
  double? get _destLng => _toCustomer ? customerLng : restaurantLng;

  String get _title =>
      _toCustomer ? AppStrings.navigateToCustomer : AppStrings.navigateToRestaurant;

  @override
  Widget build(BuildContext context) {
    final lat = _destLat;
    final lng = _destLng;
    final canNav = lat != null && lng != null;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0F000000),
              blurRadius: 16,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              width: 56,
              height: 56,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.surfaceHighlight,
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Icon(
                Icons.navigation_rounded,
                size: 28,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              _title,
              textAlign: TextAlign.center,
              style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              AppStrings.openExternalMapsHint,
              textAlign: TextAlign.center,
              style: AppTypography.bodySmall,
            ),
            if (showNavButtons) ...[
              const SizedBox(height: AppSpacing.lg),
              _MapAppButton(
                label: AppStrings.openInYandexMaps,
                icon: Icons.map_outlined,
                filled: true,
                onPressed: canNav
                    ? () async {
                        final ok = await openYandexNavigation(lat!, lng!);
                        if (!ok && context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text(AppStrings.mapLaunchFailed)),
                          );
                        }
                      }
                    : null,
              ),
              const SizedBox(height: 10),
              _MapAppButton(
                label: AppStrings.openInGoogleMaps,
                icon: Icons.public,
                filled: false,
                onPressed: canNav
                    ? () async {
                        final ok = await openGoogleNavigation(lat!, lng!);
                        if (!ok && context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text(AppStrings.mapLaunchFailed)),
                          );
                        }
                      }
                    : null,
              ),
              if (!canNav) ...[
                const SizedBox(height: 10),
                Text(
                  AppStrings.coordinatesMissing,
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(color: AppColors.danger),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _MapAppButton extends StatelessWidget {
  const _MapAppButton({
    required this.label,
    required this.icon,
    required this.filled,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final bool filled;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: Material(
        color: filled ? AppColors.primary : AppColors.surface,
        borderRadius: BorderRadius.circular(26),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(26),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(26),
              border: filled ? null : Border.all(color: AppColors.borderLight, width: 1.5),
            ),
            alignment: Alignment.center,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: filled ? AppColors.onPrimary : AppColors.textPrimary,
                ),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: AppTypography.button.copyWith(
                    color: filled ? AppColors.onPrimary : AppColors.textPrimary,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
