import 'package:flutter/material.dart';

/// iKuryer logistics platform — dark-first palette for outdoor courier use.
abstract final class AppColors {
  static const Color background = Color(0xFF0B0F14);
  static const Color surface = Color(0xFF151B24);
  static const Color surfaceElevated = Color(0xFF1E2733);
  static const Color surfaceHighlight = Color(0xFF243040);

  static const Color primary = Color(0xFF00E5A8);
  static const Color primaryHover = Color(0xFF00C896);
  static const Color primarySoft = Color(0x1A00E5A8);
  static const Color onPrimary = Color(0xFF042018);

  static const Color accent = Color(0xFF38BDF8);
  static const Color border = Color(0xFF2A3544);
  static const Color borderLight = Color(0xFF364556);

  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  static const Color online = Color(0xFF22C55E);
  static const Color onlineGlow = Color(0x4022C55E);
  static const Color offline = Color(0xFF64748B);

  static const Color danger = Color(0xFFEF4444);
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);

  /// Service-type accents (food now; taxi & cargo ready for future apps).
  static const Color serviceFood = Color(0xFFFF8C42);
  static const Color serviceTaxi = Color(0xFF38BDF8);
  static const Color serviceCargo = Color(0xFFC084FC);

  static const Color mapRoute = Color(0xFF00E5A8);
}
