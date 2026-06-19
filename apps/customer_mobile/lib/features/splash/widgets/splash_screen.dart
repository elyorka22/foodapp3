import 'package:flutter/material.dart';

/// Minimal splash — white background and brand label.
class SplashScreen extends StatefulWidget {
  const SplashScreen({
    super.key,
    this.onAnimationComplete,
    this.duration = const Duration(milliseconds: 1200),
    this.brandLabel = 'FoodApp',
  });

  final VoidCallback? onAnimationComplete;
  final Duration duration;
  final String brandLabel;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(widget.duration, () {
      if (mounted) widget.onAnimationComplete?.call();
    });
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Colors.white,
      child: Center(
        child: Text(
          widget.brandLabel,
          style: const TextStyle(
            fontSize: 34,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1A1A1A),
            letterSpacing: -0.5,
            height: 1,
          ),
        ),
      ),
    );
  }
}
