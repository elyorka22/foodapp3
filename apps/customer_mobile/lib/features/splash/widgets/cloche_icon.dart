import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Vector cloche mark — plate, revealed dish, and animated lid.
class ClocheIcon extends StatelessWidget {
  const ClocheIcon({
    super.key,
    this.size = 164,
    this.lidLift = 0,
    this.lidRotationDegrees = 0,
    this.revealProgress = 0,
    this.shadowStrength = 0.28,
  });

  final double size;
  final double lidLift;
  final double lidRotationDegrees;
  final double revealProgress;
  final double shadowStrength;

  @override
  Widget build(BuildContext context) {
    final plateHeight = size * 0.32;
    final lidHeight = size * 0.7;
    final foodHeight = size * 0.22;

    return SizedBox(
      width: size,
      height: size * 1.02,
      child: Stack(
        alignment: Alignment.bottomCenter,
        clipBehavior: Clip.none,
        children: [
          Positioned(
            bottom: size * 0.02,
            child: Opacity(
              opacity: shadowStrength,
              child: Container(
                width: size * 0.72,
                height: size * 0.08,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.35),
                      blurRadius: size * 0.14,
                      spreadRadius: size * 0.01,
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            child: CustomPaint(
              size: Size(size, plateHeight),
              painter: const _ClochePlatePainter(),
            ),
          ),
          Positioned(
            bottom: plateHeight * 0.36,
            child: Opacity(
              opacity: revealProgress.clamp(0, 1),
              child: Transform.scale(
                scale: 0.84 + (revealProgress * 0.16),
                child: CustomPaint(
                  size: Size(size * 0.56, foodHeight),
                  painter: const _ClocheFoodPainter(),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: plateHeight * 0.4,
            child: Transform.translate(
              offset: Offset(0, lidLift),
              child: Transform.rotate(
                alignment: Alignment.bottomCenter,
                angle: lidRotationDegrees * math.pi / 180,
                child: CustomPaint(
                  size: Size(size * 0.9, lidHeight),
                  painter: const _ClocheLidPainter(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ClochePlatePainter extends CustomPainter {
  const _ClochePlatePainter();

  @override
  void paint(Canvas canvas, Size size) {
    const ink = Color(0xFF111111);
    final w = size.width;
    final h = size.height;
    final center = Offset(w / 2, h * 0.64);

    final fill = Paint()
      ..color = ink
      ..style = PaintingStyle.fill;

    canvas.drawOval(
      Rect.fromCenter(center: center, width: w, height: h * 0.38),
      fill,
    );

    final bowl = Path()
      ..moveTo(w * 0.16, h * 0.56)
      ..quadraticBezierTo(w * 0.5, h * 0.98, w * 0.84, h * 0.56)
      ..close();
    canvas.drawPath(bowl, fill);

    final rim = Paint()
      ..color = ink
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCenter(center: center, width: w * 0.88, height: h * 0.3),
      math.pi,
      math.pi,
      false,
      rim,
    );
  }

  @override
  bool shouldRepaint(covariant _ClochePlatePainter oldDelegate) => false;
}

class _ClocheFoodPainter extends CustomPainter {
  const _ClocheFoodPainter();

  static const _orange = Color(0xFFFF6B00);
  static const _highlight = Color(0xFFFFB347);

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final center = Offset(w / 2, h * 0.58);

    final glow = Paint()
      ..shader = RadialGradient(
        colors: [
          _orange.withValues(alpha: 0.45),
          _orange.withValues(alpha: 0),
        ],
      ).createShader(Rect.fromCircle(center: center, radius: w * 0.55));
    canvas.drawCircle(center, w * 0.5, glow);

    final food = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [_highlight, _orange],
      ).createShader(Rect.fromCenter(center: center, width: w * 0.82, height: h * 0.72));
    canvas.drawOval(
      Rect.fromCenter(center: center, width: w * 0.78, height: h * 0.62),
      food,
    );

    final accent = Paint()..color = const Color(0xFFEA580C);
    final accentSoft = Paint()..color = const Color(0xFFEA580C).withValues(alpha: 0.8);
    canvas.drawCircle(Offset(w * 0.36, h * 0.46), w * 0.07, accent);
    canvas.drawCircle(Offset(w * 0.62, h * 0.5), w * 0.055, accentSoft);
  }

  @override
  bool shouldRepaint(covariant _ClocheFoodPainter oldDelegate) => false;
}

class _ClocheLidPainter extends CustomPainter {
  const _ClocheLidPainter();

  @override
  void paint(Canvas canvas, Size size) {
    const ink = Color(0xFF111111);
    final w = size.width;
    final h = size.height;

    final dome = Paint()
      ..color = ink
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(w * 0.11, h * 0.9)
      ..quadraticBezierTo(w * 0.03, h * 0.33, w * 0.5, h * 0.05)
      ..quadraticBezierTo(w * 0.97, h * 0.33, w * 0.89, h * 0.9)
      ..close();
    canvas.drawPath(path, dome);

    canvas.drawCircle(Offset(w * 0.5, h * 0.08), w * 0.048, dome);

    final sheen = Paint()
      ..color = Colors.white.withValues(alpha: 0.14)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCenter(center: Offset(w * 0.42, h * 0.34), width: w * 0.28, height: h * 0.42),
      math.pi * 1.15,
      math.pi * 0.42,
      false,
      sheen,
    );

    final rim = Paint()
      ..color = ink
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCenter(center: Offset(w / 2, h * 0.9), width: w * 0.72, height: h * 0.09),
      0,
      math.pi,
      false,
      rim,
    );
  }

  @override
  bool shouldRepaint(covariant _ClocheLidPainter oldDelegate) => false;
}
