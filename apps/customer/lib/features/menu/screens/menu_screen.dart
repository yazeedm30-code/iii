import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/formatting/currency.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../cart/providers/cart_providers.dart';
import '../domain/menu_models.dart';
import '../providers/menu_providers.dart';

class MenuScreen extends ConsumerWidget {
  const MenuScreen({super.key, required this.branchId});

  final String branchId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final menuAsync = ref.watch(branchMenuProvider(branchId));
    final cartCount = ref.watch(cartControllerProvider).itemCount;

    return AsyncValueView<MenuPayload>(
      value: menuAsync,
      onRetry: () => ref.invalidate(branchMenuProvider(branchId)),
      data: (menu) {
        final categories = menu.categories;
        if (categories.isEmpty) {
          return Scaffold(
            appBar: AppBar(title: const Text('القائمة')),
            body: const Center(child: Text('لا توجد منتجات في هذا الفرع')),
          );
        }
        return DefaultTabController(
          length: categories.length,
          child: Scaffold(
            appBar: AppBar(
              title: const Text('القائمة'),
              bottom: TabBar(
                isScrollable: true,
                tabs: categories.map((c) => Tab(text: c.nameAr)).toList(),
              ),
            ),
            body: TabBarView(
              children: categories
                  .map((category) => _ProductGrid(
                        branchId: branchId,
                        products: category.products,
                      ))
                  .toList(),
            ),
            floatingActionButton: FloatingActionButton.extended(
              onPressed: () => context.push('/cart'),
              label: Text('السلة ($cartCount)'),
              icon: const Icon(Icons.shopping_bag_outlined),
            ),
          ),
        );
      },
    );
  }
}

class _ProductGrid extends StatelessWidget {
  const _ProductGrid({required this.branchId, required this.products});

  final String branchId;
  final List<MenuProduct> products;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) {
      return const Center(child: Text('لا توجد منتجات في هذا القسم'));
    }
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.72,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
      ),
      itemCount: products.length,
      itemBuilder: (_, i) {
        final product = products[i];
        return _ProductTile(
          product: product,
          onTap: () => GoRouter.of(context)
              .push('/branches/$branchId/products/${product.id}'),
        );
      },
    );
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({required this.product, required this.onTap});

  final MenuProduct product;
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
                  child: Container(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.06),
                    child: product.imageUrl == null
                        ? const Center(child: Icon(Icons.local_cafe, size: 36))
                        : Image.network(product.imageUrl!, fit: BoxFit.cover),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                product.nameAr,
                style: Theme.of(context).textTheme.titleSmall,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (product.calories != null) ...<Widget>[
                const SizedBox(height: 2),
                Text(
                  '${product.calories} سعرة',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
              const SizedBox(height: 4),
              Text(formatCurrency(product.price)),
            ],
          ),
        ),
      ),
    );
  }
}
