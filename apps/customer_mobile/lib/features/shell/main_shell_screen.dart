import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
              onTap: navigationShell.goBranch,
              cartCount: cartCount,
            ),
    );
  }
}
