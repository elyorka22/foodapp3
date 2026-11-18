import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Bildirishnoma qo'ng'irog'i — matches web `notification-bell.tsx`.
///
/// - unreadCount > 0: short ring every 4s + filled Lucide bell + red badge
/// - unreadCount == 0: outline Lucide bell, no badge
/// - Respects reduce-motion
class NotificationBell extends StatefulWidget {
  const NotificationBell({
    super.key,
    required this.unreadCount,
    this.onTap,
    this.color = const Color(0xFF18181B),
    /// Lucide size on web home/profile headers.
    this.size = 22,
  });

  final int unreadCount;
  final VoidCallback? onTap;
  final Color color;
  final double size;

  @override
  State<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<NotificationBell>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 4000),
  );

  bool get _hasUnread => widget.unreadCount > 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(covariant NotificationBell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if ((oldWidget.unreadCount > 0) != _hasUnread) _sync();
  }

  void _sync() {
    final reduceMotion = MediaQuery.of(context).disableAnimations;
    if (_hasUnread && !reduceMotion) {
      if (!_c.isAnimating) _c.repeat();
    } else {
      _c
        ..stop()
        ..value = 0;
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  /// Susayib boruvchi tebranish: boshida kuchli, oxirida nolga tushadi.
  double _angle(double t) {
    const ringEnd = 0.22;
    if (t >= ringEnd) return 0;
    final p = t / ringEnd;
    return math.sin(p * math.pi * 6) * (1 - p) * 0.38;
  }

  /// Lucide `bell` — same paths as web `<Bell />`.
  Widget _lucideBell() {
    final stroke = _hasUnread ? 2.25 : 2.0;
    final fill = _hasUnread ? 'currentColor' : 'none';
    final svg = '''
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="$fill" stroke="currentColor" stroke-width="$stroke" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
</svg>
''';
    return SvgPicture.string(
      svg,
      width: widget.size,
      height: widget.size,
      theme: SvgTheme(currentColor: widget.color),
    );
  }

  @override
  Widget build(BuildContext context) {
    final count = widget.unreadCount;

    return Semantics(
      button: true,
      label: count > 0
          ? 'Bildirishnomalar, $count ta yangi'
          : 'Bildirishnomalar',
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onTap,
        // Web hit area: h-11 w-11 (44px).
        child: SizedBox(
          width: 44,
          height: 44,
          child: Stack(
            alignment: Alignment.center,
            children: [
              AnimatedBuilder(
                animation: _c,
                builder: (context, child) => Transform.rotate(
                  angle: _angle(_c.value),
                  alignment: Alignment.topCenter,
                  child: child,
                ),
                child: _lucideBell(),
              ),
              Positioned(
                top: 3,
                right: 3,
                child: AnimatedScale(
                  scale: _hasUnread ? 1 : 0,
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutBack,
                  child: Container(
                    constraints:
                        const BoxConstraints(minWidth: 18, minHeight: 18),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF3B5C),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: const Color(0xFFF5F5F7),
                        width: 2,
                      ),
                    ),
                    child: Text(
                      count > 9 ? '9+' : '$count',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        height: 1.1,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
