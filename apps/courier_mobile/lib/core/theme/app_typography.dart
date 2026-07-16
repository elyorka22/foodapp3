import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// iKuryer type system — Space Grotesk for a clean logistics feel.
abstract final class AppTypography {
  static String? get _family => GoogleFonts.spaceGrotesk().fontFamily;

  static TextStyle get display => GoogleFonts.spaceGrotesk(
        fontSize: 34,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.8,
        height: 1.1,
        color: AppColors.textPrimary,
      );

  static TextStyle get title => GoogleFonts.spaceGrotesk(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
        color: AppColors.textPrimary,
      );

  static TextStyle get subtitle => GoogleFonts.spaceGrotesk(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      );

  static TextStyle get body => GoogleFonts.spaceGrotesk(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        height: 1.4,
        color: AppColors.textPrimary,
      );

  /// Restaurant / merchant name in order cards.
  static TextStyle get merchantName => GoogleFonts.spaceGrotesk(
        fontSize: 17,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        height: 1.25,
      );

  static TextStyle get bodySmall => GoogleFonts.spaceGrotesk(
        fontSize: 13,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
      );

  static TextStyle get caption => GoogleFonts.spaceGrotesk(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.2,
        color: AppColors.textSecondary,
      );

  static TextStyle get button => GoogleFonts.spaceGrotesk(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.2,
        color: AppColors.onPrimary,
      );

  /// Large earnings / delivery counts.
  static TextStyle get metric => GoogleFonts.spaceGrotesk(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.6,
        height: 1.1,
        color: AppColors.textPrimary,
      );

  static TextStyle get metricAccent => metric.copyWith(color: AppColors.primary);

  static TextThemeData get textTheme => TextThemeData(
        displayLarge: display,
        headlineMedium: title,
        titleMedium: subtitle,
        bodyLarge: body,
        bodyMedium: bodySmall,
        labelLarge: button,
        labelSmall: caption,
        fontFamily: _family,
      );
}
