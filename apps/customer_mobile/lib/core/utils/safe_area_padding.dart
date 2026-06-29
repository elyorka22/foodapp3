import 'package:flutter/material.dart';

import '../theme/app_spacing.dart';

/// System bottom inset (home indicator / Android navigation bar).
double systemBottomInset(BuildContext context) => MediaQuery.paddingOf(context).bottom;

/// Adds bottom safe inset for scroll views (AppBar / SafeArea handle the top).
EdgeInsets scrollSafePadding(
  BuildContext context, {
  EdgeInsets base = EdgeInsets.zero,
  double extra = AppSpacing.lg,
}) {
  return base.copyWith(
    bottom: base.bottom + systemBottomInset(context) + extra,
  );
}
