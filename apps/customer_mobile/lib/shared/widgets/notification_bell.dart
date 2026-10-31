import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Bildirishnoma qo'ng'irog'i.
///
/// - unreadCount > 0: qo'ng'iroq har 4 soniyada bir marta silkinadi
///   (qisqa "jiringlash", keyin pauza) va ustida qizil nishon chiqadi.
/// - unreadCount == 0: qo'ng'iroq jim turadi, nishon yo'qoladi.
/// - Telefonda "animatsiyalarni o'chirish" yoqilgan bo'lsa, silkinmaydi.
class NotificationBell extends StatefulWidget {
  const NotificationBell({
    super.key,
    required this.unreadCount,
    this.onTap,
    this.color = const Color(0xFF1C1C24),
    this.size = 28,
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
                child: Icon(
                  _hasUnread
                      ? Icons.notifications_rounded
                      : Icons.notifications_none_rounded,
                  size: widget.size,
                  color: widget.color,
                ),
              ),
              Positioned(
                top: 3,
                right: 3,
                child: AnimatedScale(
                  scale: _hasUnread ? 1 : 0,
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutBack,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
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
