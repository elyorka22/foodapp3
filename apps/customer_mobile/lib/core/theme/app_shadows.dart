import 'package:flutter/material.dart';

abstract final class AppShadows {
  static List<BoxShadow> get card => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.06),
          blurRadius: 16,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get button => [
        BoxShadow(
          color: const Color(0xFFEA580C).withValues(alpha: 0.25),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get nav => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.06),
          blurRadius: 0,
          offset: const Offset(0, -1),
        ),
      ];
}
