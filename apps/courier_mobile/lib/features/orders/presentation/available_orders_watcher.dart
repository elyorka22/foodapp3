import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/audio/new_order_sound_service.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../home/providers/courier_home_provider.dart';
import 'available_orders_panel.dart';

/// Detects new pool orders, plays a sound, and opens the orders panel.
class AvailableOrdersWatcher extends ConsumerStatefulWidget {
  const AvailableOrdersWatcher({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<AvailableOrdersWatcher> createState() => _AvailableOrdersWatcherState();
}

class _AvailableOrdersWatcherState extends ConsumerState<AvailableOrdersWatcher> {
  final Set<String> _seenOrderIds = {};
  bool _initialized = false;
  bool _panelOpen = false;

  @override
  Widget build(BuildContext context) {
    ref.listen(availableOrdersProvider, (previous, next) {
      next.whenData(_onOrdersUpdated);
    });

    ref.listen(courierOnlineProvider, (previous, next) {
      final wasOnline = previous?.valueOrNull ?? false;
      final isOnline = next.valueOrNull ?? false;
      if (!wasOnline && isOnline) {
        _initialized = false;
        _seenOrderIds.clear();
      }
      if (!isOnline) {
        _initialized = false;
        _seenOrderIds.clear();
      }
    });

    return widget.child;
  }

  void _onOrdersUpdated(List<CourierOrderModel> orders) {
    final online = ref.read(courierOnlineProvider).valueOrNull ?? false;
    if (!online) return;

    final active = ref.read(activeOrderProvider).valueOrNull;
    if (active != null) return;

    final currentIds = orders.map((o) => o.id).toSet();

    if (!_initialized) {
      _seenOrderIds
        ..clear()
        ..addAll(currentIds);
      _initialized = true;
      if (orders.isNotEmpty) {
        _openPanel(playSound: false);
      }
      return;
    }

    final newIds = currentIds.difference(_seenOrderIds);
    _seenOrderIds
      ..clear()
      ..addAll(currentIds);

    if (newIds.isEmpty) return;

    NewOrderSoundService.instance.play();
    _openPanel(playSound: false);
  }

  Future<void> _openPanel({required bool playSound}) async {
    if (_panelOpen || !mounted) return;
    _panelOpen = true;
    try {
      await showAvailableOrdersPanel(context, ref, playSoundOnOpen: playSound);
    } finally {
      _panelOpen = false;
    }
  }
}
