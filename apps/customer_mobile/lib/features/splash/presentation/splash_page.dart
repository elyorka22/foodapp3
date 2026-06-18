import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/routes.dart';
import '../../../shared/models/auth_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/splash_screen.dart';

/// Route entry: plays splash animation, then navigates to home or complete profile.
class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  late final Future<CustomerUserModel?> _userFuture = _loadUser();
  var _animationDone = false;
  var _navigated = false;

  Future<CustomerUserModel?> _loadUser() async {
    try {
      return await ref.read(authStateProvider.future).timeout(
        const Duration(seconds: 3),
      );
    } catch (_) {
      return ref.read(authStateProvider).valueOrNull;
    }
  }

  void _onAnimationComplete() {
    _animationDone = true;
    _tryNavigate();
  }

  Future<void> _tryNavigate() async {
    if (!_animationDone || _navigated) return;

    final user = await _userFuture;
    if (!mounted || _navigated) return;

    _navigated = true;
    if (user?.needsPhone == true) {
      context.go(AppRoutes.completeProfile);
    } else {
      context.go(AppRoutes.restaurants);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFD400),
      body: SplashScreen(onAnimationComplete: _onAnimationComplete),
    );
  }
}
