import 'package:flutter/material.dart';

/// CSS-like framing: focal point + zoom (matches web categoryImageStyle).
BoxDecoration? imageFramingDecoration({
  required String? imageUrl,
  int? imageScale,
  int? imagePositionX,
  int? imagePositionY,
  BoxFit fit = BoxFit.cover,
  Color letterboxColor = Colors.white,
}) {
  if (imageUrl == null || imageUrl.isEmpty) return null;
  final x = _clamp(imagePositionX ?? 50, 0, 100) / 100;
  final y = _clamp(imagePositionY ?? 50, 0, 100) / 100;
  return BoxDecoration(
    color: fit == BoxFit.contain ? letterboxColor : null,
    image: DecorationImage(
      image: NetworkImage(imageUrl),
      fit: fit,
      alignment: Alignment(x * 2 - 1, y * 2 - 1),
    ),
  );
}

/// Widget overlay scale. Use [fit] `BoxFit.contain` + white [letterboxColor] for category tiles.
Widget applyImageFraming({
  required Widget child,
  int? imageScale,
  int? imagePositionX,
  int? imagePositionY,
  BoxFit fit = BoxFit.cover,
  Color letterboxColor = Colors.white,
}) {
  final scale = _clamp(imageScale ?? 100, 50, 200) / 100;
  final x = _clamp(imagePositionX ?? 50, 0, 100) / 100;
  final y = _clamp(imagePositionY ?? 50, 0, 100) / 100;

  Widget framed = child;
  if (scale != 1.0) {
    framed = Transform.scale(
      scale: scale,
      alignment: Alignment(x * 2 - 1, y * 2 - 1),
      child: child,
    );
  }

  return ColoredBox(
    color: fit == BoxFit.contain ? letterboxColor : Colors.transparent,
    child: ClipRect(child: framed),
  );
}

int _clamp(int value, int min, int max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
