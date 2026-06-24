import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key, required this.branchId});

  final String branchId;

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('القائمة'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: <Widget>[
              Tab(text: 'المشروبات'),
              Tab(text: 'الحلويات'),
              Tab(text: 'الإفطار'),
            ],
          ),
        ),
        body: TabBarView(
          children: List<Widget>.generate(
            3,
            (_) => GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
              ),
              itemCount: 8,
              itemBuilder: (_, i) => _ProductTile(
                title: 'منتج ${i + 1}',
                price: 18 + i,
                onTap: () => context.push('/branches/$branchId/products/p-$i'),
              ),
            ),
          ),
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => context.push('/cart'),
          label: const Text('السلة'),
          icon: const Icon(Icons.shopping_bag_outlined),
        ),
      ),
    );
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({required this.title, required this.price, required this.onTap});

  final String title;
  final int price;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Container(color: Theme.of(context).colorScheme.surface),
                ),
              ),
              const SizedBox(height: 8),
              Text(title, style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 4),
              Text('$price ر.س'),
            ],
          ),
        ),
      ),
    );
  }
}
