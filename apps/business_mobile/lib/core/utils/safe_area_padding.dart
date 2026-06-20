import 'package:flutter/material.dart';

import '../theme/app_spacing.dart';

/// System bottom inset (home indicator / Android navigation bar).
double systemBottomInset(BuildContext context) => MediaQuery.paddingOf(context).bottom;

/// Bottom padding for scroll views above a floating action button.
EdgeInsets scrollFabPadding(BuildContext context, {double fabClearance = 88}) {
  return EdgeInsets.only(
    bottom: fabClearance + systemBottomInset(context) + AppSpacing.md,
  );
}

/// Adds safe bottom inset to scroll view padding.
EdgeInsets scrollSafePadding(
  BuildContext context, {
  EdgeInsets base = EdgeInsets.zero,
  double extra = AppSpacing.lg,
}) {
  return base.copyWith(bottom: base.bottom + systemBottomInset(context) + extra);
}
