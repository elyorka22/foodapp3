import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Dark pill loader with brand wing mark + diagonal shimmer
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

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
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
    final iconSize = isLg ? 28.0 : 24.0;
    final fontSize = isLg ? 17.0 : 15.0;
    final hPad = isLg ? 28.0 : 24.0;
    final vPad = isLg ? 14.0 : 12.0;

    return Semantics(
      label: widget.label,
      liveRegion: true,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: Stack(
              alignment: Alignment.center,
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2A2E),
                    borderRadius: BorderRadius.circular(999),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x2E0F172A),
                        blurRadius: 24,
                        offset: Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: hPad,
                      vertical: vPad,
                    ),
                    child: child,
                  ),
                ),
                Positioned.fill(
                  child: IgnorePointer(
                    child: Transform.translate(
                      offset: Offset(
                        (_controller.value * 2.4 - 0.7) * 160,
                        0,
                      ),
                      child: Transform.rotate(
                        angle: -0.55,
                        child: Container(
                          width: 56,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                              colors: [
                                Colors.white.withValues(alpha: 0),
                                Colors.white.withValues(alpha: 0.28),
                                Colors.white.withValues(alpha: 0),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/images/brand_wing.png',
              width: iconSize,
              height: iconSize,
              fit: BoxFit.contain,
              filterQuality: FilterQuality.high,
              errorBuilder: (_, __, ___) => Icon(
                Icons.home_rounded,
                size: iconSize,
                color: Colors.white,
              ),
            ),
            SizedBox(width: isLg ? 12 : 10),
            Text(
              widget.label,
              style: TextStyle(
                color: Colors.white,
                fontSize: fontSize,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.2,
                height: 1.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
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
          ),
        ),
      ),
    );
  }
}
