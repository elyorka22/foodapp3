import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import '../audio/new_order_sound_service.dart';
import '../router/app_router.dart';
import 'device_registration_service.dart';
import 'notification_deep_link.dart';
import 'notification_permissions.dart';
import 'push_providers.dart';

class PushBootstrap extends ConsumerStatefulWidget {
  const PushBootstrap({required this.child, super.key});

  final Widget child;

  @override
  ConsumerState<PushBootstrap> createState() => _PushBootstrapState();
}

class _PushBootstrapState extends ConsumerState<PushBootstrap> with WidgetsBindingObserver {
  bool _permissionPromptShown = false;

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
      ref.read(deviceRegistrationServiceProvider).registerAfterAuth();
    }
  }

  Future<void> _initPush() async {
    final push = ref.read(pushNotificationServiceProvider);
    final router = ref.read(routerProvider);

    await push.initialize();

    push.onForegroundMessage((data) {
      final orderId = data['orderId'] as String?;
      if (orderId != null && orderId.isNotEmpty) {
        NewOrderSoundService.instance.play();
      }
    });

    push.onNotificationTap((data) {
      if (!mounted) return;
      navigateFromPushData(router, ref, data);
    });

    final initial = await push.getInitialNotificationData();
    if (initial != null && mounted) {
      await navigateFromPushData(router, ref, initial);
    }

    await ref.read(deviceRegistrationServiceProvider).registerAfterAuth();

    if (!mounted) return;
    await _promptForNotificationPermissionIfNeeded();
  }

  Future<void> _promptForNotificationPermissionIfNeeded() async {
    if (_permissionPromptShown || await hasPushNotificationPermission()) return;
    _permissionPromptShown = true;

    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Bildirishnomalar'),
        content: const Text(
          'Yangi buyurtmalar haqida darhol xabar olish uchun bildirishnomalarni yoqing.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Keyinroq')),
          FilledButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final granted = await requestPushNotificationPermissions();
              if (granted) {
                await ref.read(deviceRegistrationServiceProvider).registerAfterAuth();
                return;
              }
              await openAppSettings();
            },
            child: const Text('Yoqish'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
