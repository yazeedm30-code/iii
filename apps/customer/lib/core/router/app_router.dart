import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/providers/auth_providers.dart';
import '../../features/auth/screens/phone_login_screen.dart';
import '../../features/auth/screens/otp_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/branches/screens/branches_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/checkout/screens/checkout_screen.dart';
import '../../features/home/screens/home_shell.dart';
import '../../features/loyalty/screens/loyalty_screen.dart';
import '../../features/menu/screens/menu_screen.dart';
import '../../features/menu/screens/product_screen.dart';
import '../../features/orders/screens/order_tracking_screen.dart';
import '../../features/orders/screens/orders_screen.dart';
import '../../features/profile/screens/profile_screen.dart';

final Provider<GoRouter> appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final location = state.matchedLocation;

      const splashOrAuth = <String>{
        '/splash',
        '/auth/login',
        '/auth/otp',
      };

      switch (auth.status) {
        case AuthStatus.unknown:
          return location == '/splash' ? null : '/splash';
        case AuthStatus.anonymous:
          if (splashOrAuth.contains(location)) return null;
          return '/auth/login';
        case AuthStatus.needsProfile:
          return location == '/auth/register' ? null : '/auth/register';
        case AuthStatus.authenticated:
          if (location == '/splash' || location.startsWith('/auth/')) return '/';
          return null;
      }
    },
    refreshListenable: _Listenable(ref),
    routes: <RouteBase>[
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/auth/login', builder: (_, __) => const PhoneLoginScreen()),
      GoRoute(
        path: '/auth/otp',
        builder: (_, state) => OtpScreen(phone: state.uri.queryParameters['phone'] ?? ''),
      ),
      GoRoute(path: '/auth/register', builder: (_, __) => const RegisterScreen()),
      ShellRoute(
        builder: (_, __, child) => HomeShell(child: child),
        routes: <RouteBase>[
          GoRoute(path: '/', builder: (_, __) => const BranchesScreen()),
          GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
          GoRoute(path: '/loyalty', builder: (_, __) => const LoyaltyScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),
      GoRoute(
        path: '/branches/:branchId/menu',
        builder: (_, state) => MenuScreen(branchId: state.pathParameters['branchId']!),
      ),
      GoRoute(
        path: '/branches/:branchId/products/:productId',
        builder: (_, state) => ProductScreen(
          branchId: state.pathParameters['branchId']!,
          productId: state.pathParameters['productId']!,
        ),
      ),
      GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
      GoRoute(path: '/checkout', builder: (_, __) => const CheckoutScreen()),
      GoRoute(
        path: '/orders/:orderId',
        builder: (_, state) => OrderTrackingScreen(orderId: state.pathParameters['orderId']!),
      ),
    ],
  );
});

class _Listenable extends ChangeNotifier {
  _Listenable(this.ref) {
    ref.listen<AuthState>(authControllerProvider, (_, __) => notifyListeners());
  }
  final Ref ref;
}
