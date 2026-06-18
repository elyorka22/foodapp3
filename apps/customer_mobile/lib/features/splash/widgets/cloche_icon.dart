import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Black cloche (food cover + serving plate) drawn with vector paths.
class ClocheIcon extends StatelessWidget {
  const ClocheIcon({
    super.key,
    this.size = 148,
    this.lidLift = 0,
    this.lidRotationDegrees = 0,
  });

  final double size;
  final double lidLift;
  final double lidRotationDegrees;

  @override
  Widget build(BuildContext context) {
    final plateHeight = size * 0.34;
    final lidHeight = size * 0.72;

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
          Positioned(
            bottom: 0,
            child: CustomPaint(
              size: Size(size, plateHeight),
              painter: const _ClochePlatePainter(),
            ),
          ),
          Positioned(
            bottom: plateHeight * 0.42,
            child: Transform(
              alignment: Alignment.bottomCenter,
              transform: Matrix4.identity()
                ..translate(0.0, lidLift)
                ..rotateZ(lidRotationDegrees * math.pi / 180),
              child: CustomPaint(
                size: Size(size * 0.92, lidHeight),
                painter: const _ClocheLidPainter(),
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
    const color = Colors.black;
    final w = size.width;
    final h = size.height;
    final center = Offset(w / 2, h * 0.62);

    final plate = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    canvas.drawOval(
      Rect.fromCenter(center: center, width: w * 0.98, height: h * 0.42),
      plate,
    );

    final dish = Path()
      ..moveTo(w * 0.14, h * 0.58)
      ..quadraticBezierTo(w * 0.5, h * 0.98, w * 0.86, h * 0.58)
      ..close();
    canvas.drawPath(dish, plate);

    final rim = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2;
    canvas.drawArc(
      Rect.fromCenter(center: center, width: w * 0.9, height: h * 0.34),
      math.pi,
      math.pi,
      false,
      rim,
    );
  }

  @override
  bool shouldRepaint(covariant _ClochePlatePainter oldDelegate) => false;
}

class _ClocheLidPainter extends CustomPainter {
  const _ClocheLidPainter();

  @override
  void paint(Canvas canvas, Size size) {
    const color = Colors.black;
    final w = size.width;
    final h = size.height;

    final dome = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(w * 0.1, h * 0.9)
      ..quadraticBezierTo(w * 0.04, h * 0.34, w * 0.5, h * 0.06)
      ..quadraticBezierTo(w * 0.96, h * 0.34, w * 0.9, h * 0.9)
      ..close();
    canvas.drawPath(path, dome);

    canvas.drawCircle(Offset(w * 0.5, h * 0.09), w * 0.052, dome);

    final rim = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.4
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCenter(center: Offset(w / 2, h * 0.9), width: w * 0.74, height: h * 0.1),
      0,
      math.pi,
      false,
      rim,
    );
  }

  @override
  bool shouldRepaint(covariant _ClocheLidPainter oldDelegate) => false;
}
