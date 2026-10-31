import 'package:flutter/material.dart';

/// Matches frontend/src/lib/design-tokens.ts — mono zinc (white / gray / black).
abstract final class AppColors {
  static const Color primary = Color(0xFF18181B);
  static const Color primaryHover = Color(0xFF27272A);
  static const Color primaryDark = Color(0xFF09090B);
  static const Color primarySoft = Color(0xFFF4F4F5);

  static const Color surface = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF5F5F7);
  static const Color pageBackground = Color(0xFFF5F5F7);
  static const Color border = Color(0xFFE8E8EC);

  static const Color textPrimary = Color(0xFF18181B);
  static const Color textSecondary = Color(0xFF71717A);
  static const Color textMuted = Color(0xFFA1A1AA);

  static const Color danger = Color(0xFFDC2626);
  static const Color success = Color(0xFF047857);
  static const Color star = Color(0xFFFBBF24);
  static const Color freeBadge = Color(0xFF10B981);
}
