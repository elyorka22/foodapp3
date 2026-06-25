import 'package:flutter/material.dart';

const double _squareAspectMin = 0.88;
const double _squareAspectMax = 1.14;

/// Auto framing for dish photos in square menu cards (portrait/landscape → contain).
BoxFit menuProductImageFit(double naturalWidth, double naturalHeight) {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return BoxFit.cover;
  }

  final aspect = naturalWidth / naturalHeight;
  if (aspect >= _squareAspectMin && aspect <= _squareAspectMax) {
    return BoxFit.cover;
  }

  return BoxFit.contain;
}
