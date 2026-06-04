import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

enum ProfileBannerVariant { light, accent }

/// Large rounded card button (reference: banking profile banners).
class ProfileBannerTile extends StatelessWidget {
  const ProfileBannerTile({
    super.key,
    required this.onTap,
    required this.title,
    this.subtitle,
    this.heroText,
    this.heroColor,
    this.variant = ProfileBannerVariant.light,
    this.bottomRight,
  });

  final VoidCallback onTap;
  final String title;
  final String? subtitle;
  final String? heroText;
  final Color? heroColor;
  final ProfileBannerVariant variant;
  final Widget? bottomRight;

  static const Color accentGreen = Color(0xFF3B5245);
  static const Color heroGreen = Color(0xFF2F5A40);
  static const Color heroGold = Color(0xFFC9A227);

  bool get _isAccent => variant == ProfileBannerVariant.accent;

  @override
  Widget build(BuildContext context) {
    final titleColor = _isAccent ? Colors.white : AppColors.textPrimary;
    final subtitleColor =
        _isAccent ? Colors.white.withValues(alpha: 0.85) : AppColors.textMuted;

    return Material(
      color: _isAccent ? accentGreen : AppColors.surface,
      borderRadius: BorderRadius.circular(24),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Stack(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.subtitle.copyWith(
                      fontSize: _isAccent ? 17 : 16,
                      fontWeight: FontWeight.w700,
                      color: titleColor,
                      height: 1.15,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: AppTypography.caption.copyWith(
                        fontSize: 12,
                        color: subtitleColor,
                        height: 1.2,
                      ),
                    ),
                  ],
                ],
              ),
              if (heroText != null)
                Positioned(
                  left: 0,
                  bottom: 0,
                  child: Text(
                    heroText!,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      height: 1,
                      color:
                          heroColor ?? (_isAccent ? Colors.white : heroGreen),
                    ),
                  ),
                ),
              if (bottomRight != null)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: bottomRight!,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
