import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/formatting/currency.dart';
import '../domain/cart_models.dart';
import '../providers/cart_providers.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartControllerProvider);
    final controller = ref.read(cartControllerProvider.notifier);
    final tax = cart.subtotal * 0.15;
    final total = cart.subtotal + tax;

    return Scaffold(
      appBar: AppBar(
        title: const Text('السلة'),
        actions: <Widget>[
          if (!cart.isEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: controller.clear,
            ),
        ],
      ),
      body: cart.isEmpty
          ? const _EmptyCart()
          : ListView(
              padding: const EdgeInsets.all(16),
              children: <Widget>[
                for (final line in cart.lines)
                  _CartLineTile(
                    line: line,
                    onIncrease: () =>
                        controller.updateQuantity(line.lineId, line.quantity + 1),
                    onDecrease: () =>
                        controller.updateQuantity(line.lineId, line.quantity - 1),
                    onRemove: () => controller.removeLine(line.lineId),
                  ),
                const SizedBox(height: 24),
                _SummaryRow(label: 'المجموع', value: formatCurrency(cart.subtotal)),
                _SummaryRow(label: 'الضريبة (15%)', value: formatCurrency(tax)),
                const Divider(height: 32),
                _SummaryRow(label: 'الإجمالي', value: formatCurrency(total), isTotal: true),
              ],
            ),
      bottomNavigationBar: cart.isEmpty
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: FilledButton(
                  onPressed: () => context.push('/checkout'),
                  child: const Text('متابعة الدفع'),
                ),
              ),
            ),
    );
  }
}

class _EmptyCart extends StatelessWidget {
  const _EmptyCart();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(Icons.shopping_bag_outlined, size: 56),
            SizedBox(height: 12),
            Text('سلتك فارغة'),
            SizedBox(height: 4),
            Text('اختر منتجاً من القائمة لإضافته إلى سلتك'),
          ],
        ),
      ),
    );
  }
}

class _CartLineTile extends StatelessWidget {
  const _CartLineTile({
    required this.line,
    required this.onIncrease,
    required this.onDecrease,
    required this.onRemove,
  });

  final CartLine line;
  final VoidCallback onIncrease;
  final VoidCallback onDecrease;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final modifiers =
        line.modifierOptions.map((m) => m.nameAr).join(' · ');
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: <Widget>[
            Row(
              children: <Widget>[
                const Icon(Icons.local_cafe, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(line.product.nameAr,
                          style: Theme.of(context).textTheme.titleSmall),
                      if (modifiers.isNotEmpty)
                        Text(modifiers,
                            style: Theme.of(context).textTheme.bodySmall),
                      if (line.notes != null && line.notes!.isNotEmpty)
                        Text('ملاحظة: ${line.notes}',
                            style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
                Text(formatCurrency(line.lineTotal),
                    style: Theme.of(context).textTheme.titleSmall),
              ],
            ),
            Row(
              children: <Widget>[
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 20),
                  onPressed: onRemove,
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline),
                  onPressed: onDecrease,
                ),
                Text('${line.quantity}',
                    style: Theme.of(context).textTheme.titleMedium),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  onPressed: onIncrease,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value, this.isTotal = false});

  final String label;
  final String value;
  final bool isTotal;

  @override
  Widget build(BuildContext context) {
    final style = isTotal
        ? Theme.of(context).textTheme.titleMedium
        : Theme.of(context).textTheme.bodyMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[Text(label, style: style), Text(value, style: style)],
      ),
    );
  }
}
