import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../router/app_router.dart';
import 'device_registration_service.dart';
import 'notification_deep_link.dart';
import 'push_providers.dart';

/// Wires FCM, guest device registration, and auth-linked registration.
class PushBootstrap extends ConsumerStatefulWidget {
  const PushBootstrap({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<PushBootstrap> createState() => _PushBootstrapState();
}

class _PushBootstrapState extends ConsumerState<PushBootstrap> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _initPush());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      ref.read(deviceRegistrationServiceProvider).registerOnLaunch();
      ref.read(deviceRegistrationServiceProvider).registerAfterAuth();
    }
  }

  Future<void> _initPush() async {
    final push = ref.read(pushNotificationServiceProvider);
    final router = ref.read(routerProvider);

    await push.initialize();

    push.onNotificationTap((data) {
      if (!mounted) return;
      navigateFromPushData(router, data);
    });

    final initial = await push.getInitialNotificationData();
    if (initial != null && mounted) {
      navigateFromPushData(router, initial);
    }

    final devices = ref.read(deviceRegistrationServiceProvider);
    await devices.registerOnLaunch();
    await devices.registerAfterAuth();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
