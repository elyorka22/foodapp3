import 'package:flutter/material.dart';

/// Control console palette — slate surfaces, ink text, restrained blue accent.
abstract final class AppColors {
  static const Color primary = Color(0xFF0F4C81);
  static const Color primaryDark = Color(0xFF0A355A);
  static const Color primarySoft = Color(0xFFE8F1F8);

  static const Color sidebar = Color(0xFF111827);
  static const Color sidebarMuted = Color(0xFF1F2937);
  static const Color onSidebar = Color(0xFFF9FAFB);
  static const Color onSidebarMuted = Color(0xFF9CA3AF);

  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF3F4F6);
  static const Color surfaceElevated = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF3F4F6);

  static const Color border = Color(0xFFD1D5DB);
  static const Color borderLight = Color(0xFFE5E7EB);

  /// Subtle elevation — prefer borders over soft glow for ops UI.
  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF4B5563);
  static const Color textMuted = Color(0xFF9CA3AF);

  static const Color danger = Color(0xFFB91C1C);
  static const Color dangerSoft = Color(0xFFFEF2F2);
  static const Color success = Color(0xFF15803D);
  static const Color successSoft = Color(0xFFF0FDF4);
  static const Color warning = Color(0xFFB45309);
  static const Color warningSoft = Color(0xFFFFFBEB);
  static const Color info = Color(0xFF1D4ED8);
  static const Color infoSoft = Color(0xFFEFF6FF);

  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color placeholder = Color(0xFFD1D5DB);
}
