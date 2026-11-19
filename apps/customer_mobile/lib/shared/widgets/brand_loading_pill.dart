import 'dart:math' as math;

import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Brand wing mark with a spinning ring around it
/// (same asset as home-nav [LucideHomeNavIcon]).
class BrandLoadingPill extends StatefulWidget {
  const BrandLoadingPill({
    super.key,
    this.label = 'Loading..',
    this.size = BrandLoadingPillSize.md,
  });

  final String label;
  final BrandLoadingPillSize size;

  @override
  State<BrandLoadingPill> createState() => _BrandLoadingPillState();
}

enum BrandLoadingPillSize { md, lg }

class _BrandLoadingPillState extends State<BrandLoadingPill>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  static const _brand = Color(0xFF4A05CA);

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLg = widget.size == BrandLoadingPillSize.lg;
    final box = isLg ? 72.0 : 56.0;
    final iconSize = isLg ? 36.0 : 28.0;
    final stroke = isLg ? 3.0 : 2.5;

    return Semantics(
      label: widget.label,
      liveRegion: true,
      child: SizedBox(
        width: box,
        height: box,
        child: Stack(
          alignment: Alignment.center,
          children: [
            AnimatedBuilder(
              animation: _controller,
              builder: (context, _) {
                return Transform.rotate(
                  angle: _controller.value * 2 * math.pi,
                  child: CustomPaint(
                    size: Size(box, box),
                    painter: _RingPainter(strokeWidth: stroke),
                  ),
                );
              },
            ),
            Image.asset(
              'assets/images/brand_wing.png',
              width: iconSize,
              height: iconSize,
              fit: BoxFit.contain,
              filterQuality: FilterQuality.high,
              errorBuilder: (_, __, ___) => Icon(
                Icons.home_rounded,
                size: iconSize,
                color: _brand,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter({required this.strokeWidth});

  final double strokeWidth;

  static const _brand = Color(0xFF4A05CA);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.shortestSide - strokeWidth) / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);

    final track = Paint()
      ..color = _brand.withValues(alpha: 0.15)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, track);

    final arc = Paint()
      ..color = _brand
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    // ~28% of the circle — a short spinning line.
    canvas.drawArc(rect, -math.pi / 2, math.pi * 0.55, false, arc);
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) =>
      oldDelegate.strokeWidth != strokeWidth;
}

/// Centered loader for page / section loading states.
class BrandLoadingState extends StatelessWidget {
  const BrandLoadingState({
    super.key,
    this.label,
    this.minHeight = 192,
  });

  final String? label;
  final double minHeight;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: minHeight,
      child: ColoredBox(
        color: AppColors.background,
        child: Center(
          child: BrandLoadingPill(
            label: label ?? 'Loading..',
            size: BrandLoadingPillSize.lg,
          ),
        ),
      ),
    );
  }
}
