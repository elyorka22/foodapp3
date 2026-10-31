import 'package:flutter/material.dart';

/// Matches frontend/src/lib/design-tokens.ts shadows.
abstract final class AppShadows {
  static List<BoxShadow> get card => const [
        BoxShadow(
          color: Color(0x0F000000),
          blurRadius: 16,
          offset: Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get serviceTile => const [
        BoxShadow(
          color: Color(0x0A0F172A),
          blurRadius: 12,
          offset: Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get promo => const [
        BoxShadow(
          color: Color(0x140F172A),
          blurRadius: 24,
          offset: Offset(0, 8),
        ),
      ];

  static List<BoxShadow> get button => const [
        BoxShadow(
          color: Color(0x2E000000),
          blurRadius: 12,
          offset: Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get nav => const [
        BoxShadow(
          color: Color(0x0F000000),
          blurRadius: 0,
          offset: Offset(0, -1),
        ),
      ];
}
