import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/router/routes.dart';
import '../../../shared/widgets/food_app_bottom_nav.dart';
import '../cart/providers/cart_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MainShellScreen extends ConsumerWidget {
  const MainShellScreen({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const _authSubRoutes = ['/profile/telegram', '/profile/login', '/profile/register'];

  bool _hideBottomNav(BuildContext context) {
    final path = GoRouterState.of(context).uri.path;
    return _authSubRoutes.contains(path);
  }

  void _onNavTap(BuildContext context, int index) {
    final target = switch (index) {
      0 => AppRoutes.restaurants,
      1 => AppRoutes.cart,
      _ => AppRoutes.profile,
    };
    context.go(target);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartProvider.select((c) => c.fold(0, (s, i) => s + i.quantity)));
    final hideBottomNav = _hideBottomNav(context);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: hideBottomNav
          ? null
          : FoodAppBottomNav(
              currentIndex: navigationShell.currentIndex,
              onTap: (index) => _onNavTap(context, index),
              cartCount: cartCount,
            ),
    );
  }
}
