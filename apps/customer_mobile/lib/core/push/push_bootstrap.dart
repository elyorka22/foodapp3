import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../router/app_router.dart';
import 'device_registration_service.dart';
import 'notification_deep_link.dart';
import 'push_providers.dart';

/// Wires FCM taps, cold-start deep links, and device registration when session exists.
class PushBootstrap extends ConsumerStatefulWidget {
  const PushBootstrap({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<PushBootstrap> createState() => _PushBootstrapState();
}

class _PushBootstrapState extends ConsumerState<PushBootstrap> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initPush());
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

    await ref.read(deviceRegistrationServiceProvider).registerAfterAuth();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
