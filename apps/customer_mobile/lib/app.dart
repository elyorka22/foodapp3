import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/push/push_bootstrap.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

class FoodApp extends ConsumerWidget {
  const FoodApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return PushBootstrap(
      child: MaterialApp.router(
        title: 'FoodApp',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        routerConfig: router,
      ),
    );
  }
}
