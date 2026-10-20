import 'package:flutter/material.dart';

/// Control console — cool graphite ops palette, single steel-blue accent.
abstract final class AppColors {
  static const Color primary = Color(0xFF1B4F72);
  static const Color primaryDark = Color(0xFF133A54);
  static const Color primarySoft = Color(0xFFE8EEF3);

  static const Color sidebar = Color(0xFF0B1220);
  static const Color sidebarMuted = Color(0xFF151E2E);
  static const Color sidebarHover = Color(0xFF1C2738);
  static const Color onSidebar = Color(0xFFF3F6FA);
  static const Color onSidebarMuted = Color(0xFF8B97A8);
  static const Color sidebarAccent = Color(0xFF3D7AB0);

  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF5F7FA);
  static const Color surfaceElevated = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFEEF1F5);

  static const Color border = Color(0xFFC9D1DC);
  static const Color borderLight = Color(0xFFE2E7EE);

  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color(0x0A0B1220),
      blurRadius: 1,
      offset: Offset(0, 1),
    ),
  ];

  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);

  static const Color danger = Color(0xFFB42318);
  static const Color dangerSoft = Color(0xFFFEF3F2);
  static const Color success = Color(0xFF067647);
  static const Color successSoft = Color(0xFFECFDF3);
  static const Color warning = Color(0xFFB54708);
  static const Color warningSoft = Color(0xFFFFFAEB);
  static const Color info = Color(0xFF175CD3);
  static const Color infoSoft = Color(0xFFEFF8FF);

  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color placeholder = Color(0xFFCBD5E1);
}
