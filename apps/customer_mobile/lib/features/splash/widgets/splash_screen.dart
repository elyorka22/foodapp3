import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import 'cloche_icon.dart';

/// Premium animated splash with cloche reveal — reusable across the app.
class SplashScreen extends StatefulWidget {
  const SplashScreen({
    super.key,
    this.onAnimationComplete,
    this.duration = const Duration(milliseconds: 1600),
    this.backgroundColor = const Color(0xFFFFD400),
    this.brandLabel = 'FOODAPP',
  });

  final VoidCallback? onAnimationComplete;
  final Duration duration;
  final Color backgroundColor;
  final String brandLabel;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  static const _clocheSize = 148.0;
  static const _lidLiftDistance = 54.0;
  static const _lidRotationEnd = -12.0;

  late final AnimationController _controller;

  late final Animation<double> _clocheScale;
  late final Animation<double> _lidProgress;
  late final Animation<double> _textOpacity;
  late final Animation<double> _textSlide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);

    _clocheScale = Tween<double>(begin: 0.92, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0, 0.36, curve: Curves.easeOutCubic),
      ),
    );

    _lidProgress = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.26, 0.72, curve: Curves.easeOutBack),
      ),
    );

    _textOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.62, 1, curve: Curves.easeOutCubic),
      ),
    );

    _textSlide = Tween<double>(begin: 18, end: 0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.62, 1, curve: Curves.easeOutCubic),
      ),
    );

    _controller.addStatusListener(_onStatusChanged);
    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (mounted) _controller.forward();
    });
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
    return ColoredBox(
      color: widget.backgroundColor,
      child: SizedBox.expand(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, _) {
            final lidLift = -_lidLiftDistance * _lidProgress.value;
            final lidRotation = _lidRotationEnd * _lidProgress.value;

            return Center(
              child: RepaintBoundary(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Transform.scale(
                      scale: _clocheScale.value,
                      child: ClocheIcon(
                        size: _clocheSize,
                        lidLift: lidLift,
                        lidRotationDegrees: lidRotation,
                      ),
                    ),
                    const SizedBox(height: 28),
                    Opacity(
                      opacity: _textOpacity.value,
                      child: Transform.translate(
                        offset: Offset(0, _textSlide.value),
                        child: Text(
                          widget.brandLabel,
                          style: const TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 5,
                            height: 1,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
