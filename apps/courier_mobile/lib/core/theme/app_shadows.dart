import 'package:flutter/material.dart';

abstract final class AppShadows {
  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x33000000),
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
  ];

  static const List<BoxShadow> button = [
    BoxShadow(
      color: Color(0x4D00E5A8),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
  ];

  static const List<BoxShadow> glowOnline = [
    BoxShadow(
      color: Color(0x5022C55E),
      blurRadius: 24,
      spreadRadius: 2,
    ),
  ];

  static const List<BoxShadow> brandGlow = [
    BoxShadow(
      color: Color(0x4000E5A8),
      blurRadius: 40,
      spreadRadius: 0,
    ),
  ];
}
