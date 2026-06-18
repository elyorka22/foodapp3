import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'cloche_icon.dart';

/// Premium FoodApp splash — reusable animated intro.
class SplashScreen extends StatefulWidget {
  const SplashScreen({
    super.key,
    this.onAnimationComplete,
    this.duration = const Duration(milliseconds: 2200),
    this.brandLabel = 'FOODAPP',
    this.tagline = 'Tez. Issiq. Mazali.',
  });

  final VoidCallback? onAnimationComplete;
  final Duration duration;
  final String brandLabel;
  final String tagline;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  static const _brandYellow = Color(0xFFFFD400);
  static const _brandYellowDeep = Color(0xFFF2C200);
  static const _brandOrange = Color(0xFFFF6B00);

  static const _clocheSize = 164.0;
  static const _lidLiftDistance = 58.0;
  static const _lidRotationEnd = -14.0;

  late final AnimationController _controller;

  late final Animation<double> _sceneOpacity;
  late final Animation<double> _glowPulse;
  late final Animation<double> _clocheScale;
  late final Animation<double> _clocheOpacity;
  late final Animation<double> _lidProgress;
  late final Animation<double> _foodReveal;
  late final Animation<double> _wordmarkOpacity;
  late final Animation<double> _wordmarkSlide;
  late final Animation<double> _wordmarkTracking;
  late final Animation<double> _taglineOpacity;
  late final Animation<double> _taglineSlide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _buildAnimations();

    _controller.addStatusListener(_onStatusChanged);
    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (mounted) _controller.forward();
    });
  }

  void _buildAnimations() {
    _sceneOpacity = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0, 0.12, curve: Curves.easeOut),
    );

    _glowPulse = Tween<double>(begin: 0.55, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.08, 0.55, curve: Curves.easeOutCubic),
      ),
    );

    _clocheScale = Tween<double>(begin: 0.86, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.04, 0.34, curve: Curves.easeOutCubic),
      ),
    );

    _clocheOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.04, 0.22, curve: Curves.easeOut),
      ),
    );

    _lidProgress = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.28, 0.62, curve: Curves.easeOutBack),
      ),
    );

    _foodReveal = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.36, 0.68, curve: Curves.easeOutCubic),
    );

    _wordmarkOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.54, 0.82, curve: Curves.easeOutCubic),
      ),
    );

    _wordmarkSlide = Tween<double>(begin: 22, end: 0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.54, 0.82, curve: Curves.easeOutCubic),
      ),
    );

    _wordmarkTracking = Tween<double>(begin: 8, end: 5).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.54, 0.9, curve: Curves.easeOutCubic),
      ),
    );

    _taglineOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.68, 0.92, curve: Curves.easeOut),
      ),
    );

    _taglineSlide = Tween<double>(begin: 10, end: 0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.68, 0.92, curve: Curves.easeOutCubic),
      ),
    );
  }

  void _onStatusChanged(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      widget.onAnimationComplete?.call();
    }
  }

  @override
  void dispose() {
    _controller
      ..removeStatusListener(_onStatusChanged)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final lidLift = -_lidLiftDistance * _lidProgress.value;
        final lidRotation = _lidRotationEnd * _lidProgress.value;

        return Opacity(
          opacity: _sceneOpacity.value,
          child: DecoratedBox(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [_brandYellow, _brandYellowDeep],
              ),
            ),
            child: SizedBox.expand(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  _AmbientGlow(intensity: _glowPulse.value),
                  Center(
                    child: RepaintBoundary(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Opacity(
                            opacity: _clocheOpacity.value,
                            child: Transform.scale(
                              scale: _clocheScale.value,
                              child: ClocheIcon(
                                size: _clocheSize,
                                lidLift: lidLift,
                                lidRotationDegrees: lidRotation,
                                revealProgress: _foodReveal.value,
                                shadowStrength: 0.18 + (_clocheOpacity.value * 0.16),
                              ),
                            ),
                          ),
                          const SizedBox(height: 34),
                          Opacity(
                            opacity: _wordmarkOpacity.value,
                            child: Transform.translate(
                              offset: Offset(0, _wordmarkSlide.value),
                              child: _BrandWordmark(
                                label: widget.brandLabel,
                                letterSpacing: _wordmarkTracking.value,
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Opacity(
                            opacity: _taglineOpacity.value,
                            child: Transform.translate(
                              offset: Offset(0, _taglineSlide.value),
                              child: Text(
                                widget.tagline,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.4,
                                  color: Colors.black.withValues(alpha: 0.62),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _AmbientGlow extends StatelessWidget {
  const _AmbientGlow({required this.intensity});

  final double intensity;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final radius = math.min(size.width, size.height) * 0.34;

    return IgnorePointer(
      child: Center(
        child: Container(
          width: radius * 2,
          height: radius * 2,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                const Color(0xFFFF6B00).withValues(alpha: 0.14 * intensity),
                const Color(0xFFFF6B00).withValues(alpha: 0),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BrandWordmark extends StatelessWidget {
  const _BrandWordmark({
    required this.label,
    required this.letterSpacing,
  });

  final String label;
  final double letterSpacing;

  @override
  Widget build(BuildContext context) {
    final text = label.toUpperCase();
    if (text.length < 4) {
      return Text(
        text,
        style: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          letterSpacing: letterSpacing,
          height: 1,
          color: const Color(0xFF111111),
        ),
      );
    }

    final splitAt = text.startsWith('FOOD') ? 4 : (text.length / 2).floor();
    final first = text.substring(0, splitAt);
    final second = text.substring(splitAt);

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          first,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            letterSpacing: letterSpacing,
            height: 1,
            color: const Color(0xFF111111),
          ),
        ),
        Text(
          second,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            letterSpacing: letterSpacing,
            height: 1,
            color: const Color(0xFFFF6B00),
          ),
        ),
      ],
    );
  }
}
