import 'package:flutter/material.dart';

/// CSS-like cover framing: focal point + zoom (matches web categoryImageStyle).
BoxDecoration? imageFramingDecoration({
  required String? imageUrl,
  int? imageScale,
  int? imagePositionX,
  int? imagePositionY,
}) {
  if (imageUrl == null || imageUrl.isEmpty) return null;
  final scale = _clamp(imageScale ?? 100, 50, 200) / 100;
  final x = _clamp(imagePositionX ?? 50, 0, 100) / 100;
  final y = _clamp(imagePositionY ?? 50, 0, 100) / 100;
  return BoxDecoration(
    image: DecorationImage(
      image: NetworkImage(imageUrl),
      fit: BoxFit.cover,
      alignment: Alignment(x * 2 - 1, y * 2 - 1),
    ),
  );
}

/// Widget overlay scale via Transform on top of cover image.
Widget applyImageFraming({
  required Widget child,
  int? imageScale,
  int? imagePositionX,
  int? imagePositionY,
}) {
  final scale = _clamp(imageScale ?? 100, 50, 200) / 100;
  if (scale == 1.0) return child;
  final x = _clamp(imagePositionX ?? 50, 0, 100) / 100;
  final y = _clamp(imagePositionY ?? 50, 0, 100) / 100;
  return ClipRect(
    child: Transform.scale(
      scale: scale,
      alignment: Alignment(x * 2 - 1, y * 2 - 1),
      child: child,
    ),
  );
}

int _clamp(int value, int min, int max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
