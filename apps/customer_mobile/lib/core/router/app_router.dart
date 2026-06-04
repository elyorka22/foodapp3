import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/complete_profile_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/presentation/telegram_login_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/checkout/presentation/checkout_screen.dart';
import '../../features/debug/presentation/network_health_screen.dart';
import '../../features/orders/presentation/order_tracking_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/promotions/presentation/promotions_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/restaurants/presentation/category_products_screen.dart';
import '../../features/restaurants/presentation/restaurant_detail_screen.dart';
import '../../features/restaurants/presentation/restaurants_screen.dart';
import '../../features/shell/main_shell_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/stores/presentation/store_detail_screen.dart';
import '../../features/stores/presentation/stores_screen.dart';
import 'routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final needsPhone = ref.read(authStateProvider.notifier).needsPhoneCompletion;
      final onComplete = state.matchedLocation == AppRoutes.completeProfile;
      if (needsPhone && !onComplete) {
        return AppRoutes.completeProfile;
      }
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.checkout,
        builder: (_, __) => const CheckoutScreen(),
      ),
      GoRoute(
        path: AppRoutes.completeProfile,
        builder: (_, __) => const CompleteProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        builder: (_, __) => const NotificationsScreen(),
      ),
      GoRoute(
        path: AppRoutes.promotions,
        builder: (_, __) => const PromotionsScreen(),
      ),
      GoRoute(
        path: AppRoutes.networkHealth,
        builder: (_, __) => const NetworkHealthScreen(),
      ),
      GoRoute(
        path: '${AppRoutes.categoryProducts}/:slug',
        builder: (_, state) => CategoryProductsScreen(
          slug: state.pathParameters['slug']!,
        ),
      ),
      GoRoute(
        path: '${AppRoutes.orderTrack}/:token',
        builder: (_, state) => OrderTrackingScreen(
          trackingToken: state.pathParameters['token']!,
        ),
      ),
      GoRoute(
        path: AppRoutes.stores,
        builder: (_, __) => const StoresScreen(),
        routes: [
          GoRoute(
            path: ':slug',
            builder: (_, state) => StoreDetailScreen(
              slug: state.pathParameters['slug']!,
            ),
          ),
        ],
      ),
      StatefulShellRoute.indexedStack(
        builder: (_, __, navigationShell) =>
            MainShellScreen(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.restaurants,
                builder: (_, __) => const RestaurantsScreen(),
                routes: [
                  GoRoute(
                    path: ':slug',
                    builder: (_, state) => RestaurantDetailScreen(
                      slug: state.pathParameters['slug']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.cart,
                builder: (_, __) => const CartScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                builder: (_, __) => const ProfileScreen(),
                routes: [
                  GoRoute(
                    path: 'login',
                    builder: (_, __) => const LoginScreen(),
                  ),
                  GoRoute(
                    path: 'register',
                    builder: (_, __) => const RegisterScreen(),
                  ),
                  GoRoute(
                    path: 'telegram',
                    builder: (_, __) => const TelegramLoginScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
    errorBuilder: (_, state) => Scaffold(
      body: Center(child: Text(state.error.toString())),
    ),
  );
});
