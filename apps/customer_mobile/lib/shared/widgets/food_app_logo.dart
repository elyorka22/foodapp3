import 'package:flutter/material.dart';

/// FoodApp brand mark bundled in assets/images/.
class FoodAppLogo extends StatelessWidget {
  const FoodAppLogo({
    super.key,
    this.size = 48,
    this.borderRadius = 16,
  });

  final double size;
  final double borderRadius;

  static const _asset = 'assets/images/app_icon_192.png';

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: Image.asset(
        _asset,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          width: size,
          height: size,
          color: const Color(0xFFFF6B00),
          alignment: Alignment.center,
          child: const Text(
            'F',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
