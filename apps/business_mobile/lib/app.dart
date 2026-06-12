import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/config/app_config.dart';
import 'core/push/push_bootstrap.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

class BusinessApp extends ConsumerWidget {
  const BusinessApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return PushBootstrap(
      child: MaterialApp.router(
        title: AppConfig.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        routerConfig: router,
      ),
    );
  }
}
