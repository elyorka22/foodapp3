import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Soft abstract city-grid backdrop from the courier design board.
class SoftMapBackdrop extends StatelessWidget {
  const SoftMapBackdrop({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        const ColoredBox(color: Color(0xFFE4E7EB)),
        CustomPaint(painter: _SoftMapPainter()),
        child,
      ],
    );
  }
}

class _SoftMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final road = Paint()
      ..color = Colors.white
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    road.strokeWidth = size.width * 0.04;
    for (final y in [0.25, 0.52, 0.78]) {
      canvas.drawLine(Offset(0, size.height * y), Offset(size.width, size.height * y), road);
    }
    for (final x in [0.23, 0.51, 0.79]) {
      canvas.drawLine(Offset(size.width * x, 0), Offset(size.width * x, size.height), road);
    }

    road.strokeWidth = size.width * 0.018;
    canvas.drawLine(
      Offset(0, size.height * 0.12),
      Offset(size.width * 0.23, size.height * 0.12),
      road,
    );
    canvas.drawLine(
      Offset(size.width * 0.51, size.height * 0.38),
      Offset(size.width, size.height * 0.38),
      road,
    );
    canvas.drawLine(
      Offset(0, size.height * 0.65),
      Offset(size.width * 0.51, size.height * 0.65),
      road,
    );

    final park = Paint()..color = const Color(0xFFD5E7D8);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.55, size.height * 0.54, size.width * 0.21, size.height * 0.21),
        const Radius.circular(10),
      ),
      park,
    );

    final water = Paint()..color = const Color(0xFFD3E4F1);
    final path = Path()
      ..moveTo(size.width * 0.82, size.height * 0.8)
      ..lineTo(size.width, size.height * 0.8)
      ..lineTo(size.width, size.height)
      ..lineTo(size.width * 0.84, size.height)
      ..quadraticBezierTo(size.width * 0.82, size.height * 0.9, size.width * 0.82, size.height * 0.8)
      ..close();
    canvas.drawPath(path, water);

    final fade = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          AppColors.background.withValues(alpha: 0.15),
          AppColors.background.withValues(alpha: 0.55),
          AppColors.background.withValues(alpha: 0.92),
        ],
        stops: const [0.0, 0.45, 1.0],
      ).createShader(Offset.zero & size);
    canvas.drawRect(Offset.zero & size, fade);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
