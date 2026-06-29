import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Android 15+ edge-to-edge: transparent system bars, content laid out behind them.
/// Pair with [SafeArea] / [scrollSafePadding] on screens and native MainActivity patch.
void configureEdgeToEdge() {
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(edgeToEdgeOverlay);
}

const SystemUiOverlayStyle edgeToEdgeOverlay = SystemUiOverlayStyle(
  statusBarColor: Colors.transparent,
  systemNavigationBarColor: Colors.transparent,
  systemNavigationBarContrastEnforced: false,
  statusBarIconBrightness: Brightness.dark,
  systemNavigationBarIconBrightness: Brightness.dark,
);
