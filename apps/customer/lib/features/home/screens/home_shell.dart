import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeShell extends StatelessWidget {
  const HomeShell({super.key, required this.child});

  final Widget child;

  static const List<_NavItem> _items = <_NavItem>[
    _NavItem(label: 'الفروع', icon: Icons.store_mall_directory_outlined, route: '/'),
    _NavItem(label: 'طلباتي', icon: Icons.receipt_long_outlined, route: '/orders'),
    _NavItem(label: 'الولاء', icon: Icons.workspace_premium_outlined, route: '/loyalty'),
    _NavItem(label: 'حسابي', icon: Icons.person_outline, route: '/profile'),
  ];

  int _indexOf(BuildContext context) {
    final String location = GoRouterState.of(context).matchedLocation;
    for (int i = 0; i < _items.length; i += 1) {
      if (location == _items[i].route) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _indexOf(context),
        onDestinationSelected: (i) => context.go(_items[i].route),
        destinations: _items
            .map((it) => NavigationDestination(icon: Icon(it.icon), label: it.label))
            .toList(growable: false),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({required this.label, required this.icon, required this.route});
  final String label;
  final IconData icon;
  final String route;
}
