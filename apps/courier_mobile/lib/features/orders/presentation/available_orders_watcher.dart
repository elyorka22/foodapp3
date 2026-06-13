import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/audio/alert_preferences.dart';
import '../../../core/audio/new_order_sound_service.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../home/providers/courier_home_provider.dart';
import '../providers/new_job_alert_provider.dart';

/// Plays sound/vibration and shows banner when a new pool job appears.
class AvailableOrdersWatcher extends ConsumerStatefulWidget {
  const AvailableOrdersWatcher({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<AvailableOrdersWatcher> createState() => _AvailableOrdersWatcherState();
}

class _AvailableOrdersWatcherState extends ConsumerState<AvailableOrdersWatcher> {
  final Set<String> _seenOrderIds = {};
  bool _initialized = false;

  @override
  Widget build(BuildContext context) {
    ref.listen(availableOrdersProvider, (previous, next) {
      next.whenData(_onOrdersUpdated);
    });

    ref.listen(shiftSessionOpenProvider, (previous, next) {
      if (previous != next) {
        _initialized = false;
        _seenOrderIds.clear();
        ref.read(newJobAlertProvider.notifier).state = null;
      }
    });

    return widget.child;
  }

  void _onOrdersUpdated(List<CourierOrderModel> orders) {
    final shiftOpen = ref.read(shiftSessionOpenProvider);
    final backendOnline = ref.read(courierOnlineProvider).valueOrNull ?? false;
    if (!shiftOpen && !backendOnline) return;

    final active = ref.read(activeOrderProvider).valueOrNull;
    if (active != null) return;

    final currentIds =
        orders.where((order) => order.isPendingOffer).map((order) => order.id).toSet();

    if (!_initialized) {
      _seenOrderIds
        ..clear()
        ..addAll(currentIds);
      _initialized = true;
      return;
    }

    final newIds = currentIds.difference(_seenOrderIds);
    _seenOrderIds
      ..clear()
      ..addAll(currentIds);

    if (newIds.isEmpty) return;

    final prefs = ref.read(alertPreferencesProvider);
    NewOrderSoundService.instance.play(
      soundEnabled: prefs.soundEnabled,
      vibrationEnabled: prefs.vibrationEnabled,
    );

    final pendingOffers = orders.where((order) => order.isPendingOffer).toList();
    if (pendingOffers.isEmpty) return;

    final newest = pendingOffers.firstWhere(
      (o) => newIds.contains(o.id),
      orElse: () => pendingOffers.first,
    );

    ref.read(newJobAlertProvider.notifier).state = NewJobAlert(
      orderId: newest.id,
      title: newest.restaurantName ?? newest.orderNumber,
      payAtRestaurant: newest.orderAmount,
      collectFromCustomer: newest.collectFromCustomer,
      courierEarnings: newest.courierEarnings,
    );
  }
}
