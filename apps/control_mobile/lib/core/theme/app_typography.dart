import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// IBM Plex Sans — dense, readable ops UI (not a marketing display face).
abstract final class AppTypography {
  static TextStyle _plex({
    required double fontSize,
    required FontWeight fontWeight,
    double height = 1.35,
    double letterSpacing = 0,
    Color color = AppColors.textPrimary,
  }) {
    return GoogleFonts.ibmPlexSans(
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
      letterSpacing: letterSpacing,
      color: color,
    );
  }

  static TextStyle get display => _plex(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.35,
        height: 1.2,
      );

  static TextStyle get title => _plex(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.15,
        height: 1.25,
      );

  static TextStyle get subtitle => _plex(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 1.3,
      );

  static TextStyle get body => _plex(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.4,
      );

  static TextStyle get bodySmall => _plex(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.35,
        color: AppColors.textSecondary,
      );

  static TextStyle get caption => _plex(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        height: 1.3,
        color: AppColors.textSecondary,
      );

  static TextStyle get overline => _plex(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.6,
        height: 1.2,
        color: AppColors.onSidebarMuted,
      );

  static TextStyle get button => _plex(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.05,
        color: AppColors.onPrimary,
      );

  static TextTheme textTheme(TextTheme base) {
    return GoogleFonts.ibmPlexSansTextTheme(base).copyWith(
      displaySmall: display,
      titleLarge: title,
      titleMedium: subtitle,
      bodyLarge: body,
      bodyMedium: body,
      bodySmall: bodySmall,
      labelLarge: button,
      labelMedium: caption,
      labelSmall: overline,
    );
  }
}
