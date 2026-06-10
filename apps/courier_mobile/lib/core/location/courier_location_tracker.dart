import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../../features/orders/data/courier_repository.dart';
import 'courier_location_service.dart';

/// Sends courier GPS to the backend while logged in (every ~30s or 50m move).
class CourierLocationTracker extends ConsumerStatefulWidget {
  const CourierLocationTracker({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<CourierLocationTracker> createState() => _CourierLocationTrackerState();
}

class _CourierLocationTrackerState extends ConsumerState<CourierLocationTracker> {
  StreamSubscription<Position>? _subscription;

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  void _syncTracking() {
    final loggedIn = ref.read(authStateProvider).valueOrNull != null;
    if (!loggedIn) {
      _subscription?.cancel();
      _subscription = null;
      return;
    }
    if (_subscription != null) return;

    _subscription = CourierLocationService().watchPosition().listen(
      (position) async {
        try {
          await ref.read(courierRepositoryProvider).updateLocation(
                position.latitude,
                position.longitude,
              );
        } catch (_) {}
      },
      onError: (_) {},
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authStateProvider, (_, __) {
      _subscription?.cancel();
      _subscription = null;
      _syncTracking();
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => _syncTracking());
    return widget.child;
  }
}
