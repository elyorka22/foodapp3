import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/food_app_bottom_nav.dart';
import '../cart/providers/cart_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MainShellScreen extends ConsumerWidget {
  const MainShellScreen({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartProvider.select((c) => c.fold(0, (s, i) => s + i.quantity)));

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: FoodAppBottomNav(
        currentIndex: navigationShell.currentIndex,
        onTap: navigationShell.goBranch,
        cartCount: cartCount,
      ),
    );
  }
}
