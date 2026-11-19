import 'package:flutter/material.dart';

/// Colors from «Biznes ilova dizayni» (store green + restaurant orange).
abstract final class AppColors {
  /// Store / default brand green.
  static const Color primary = Color(0xFF0B7A55);
  static const Color primaryDark = Color(0xFF0B6B4A);
  static const Color primarySoft = Color(0xFFE4F4EC);

  /// Restaurant accent (accept / cooking actions).
  static const Color restaurant = Color(0xFFC2410C);
  static const Color restaurantSoft = Color(0xFFFDEBDD);
  static const Color restaurantMuted = Color(0xFF9A3412);

  static const Color accent = restaurant;
  static const Color accentSoft = restaurantSoft;

  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF4F5F3);
  /// Store canvas.
  static const Color background = Color(0xFFF4F5F3);
  /// Restaurant canvas (warmer).
  static const Color backgroundRestaurant = Color(0xFFF6F3EF);

  static const Color border = Color(0xFFD5DAD3);
  static const Color borderLight = Color(0xFFE4E7E3);
  static const Color borderRestaurant = Color(0xFFE8E1D9);

  static const Color textPrimary = Color(0xFF15191C);
  static const Color textRestaurant = Color(0xFF1C1713);
  static const Color textSecondary = Color(0xFF5B6570);
  static const Color textSecondaryRestaurant = Color(0xFF675E56);
  static const Color textMuted = Color(0xFF9AA3AB);

  static const Color danger = Color(0xFFB42318);
  static const Color dangerSoft = Color(0xFFFDE7E4);
  static const Color success = Color(0xFF0B7A55);
  static const Color successSoft = Color(0xFFE4F4EC);
  static const Color warning = Color(0xFF8A5A00);
  static const Color warningSoft = Color(0xFFFFF4D6);
  static const Color info = Color(0xFF1D4F91);
  static const Color infoSoft = Color(0xFFE3EEFB);

  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color ink = Color(0xFF15191C);

  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x0A0F172A),
      blurRadius: 12,
      offset: Offset(0, 2),
    ),
  ];
}
