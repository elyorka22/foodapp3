import 'package:flutter/material.dart';

abstract final class Breakpoints {
  static const double compact = 600;
  static const double medium = 1024;

  static bool isCompact(BuildContext context) =>
      MediaQuery.sizeOf(context).width < compact;

  static bool isWide(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= medium;
}
