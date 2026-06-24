import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/formatting/currency.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../cart/providers/cart_providers.dart';
import '../domain/menu_models.dart';
import '../providers/menu_providers.dart';

class ProductScreen extends ConsumerStatefulWidget {
  const ProductScreen({super.key, required this.branchId, required this.productId});

  final String branchId;
  final String productId;

  @override
  ConsumerState<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends ConsumerState<ProductScreen> {
  final Map<String, Set<String>> _selected = <String, Set<String>>{};
  final TextEditingController _notes = TextEditingController();
  int _quantity = 1;
  bool _initialized = false;

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  void _ensureDefaults(MenuProduct product) {
    if (_initialized) return;
    _initialized = true;
    for (final group in product.modifierGroups) {
      final defaults = group.options
          .where((o) => o.isDefault)
          .map((o) => o.id)
          .toSet();
      if (defaults.isEmpty && group.isRequired && group.minSelections > 0) {
        defaults.addAll(group.options
            .take(group.minSelections)
            .map((o) => o.id));
      }
      _selected[group.id] = defaults;
    }
  }

  double _modifiersDelta(MenuProduct product) {
    double delta = 0;
    for (final group in product.modifierGroups) {
      final picks = _selected[group.id] ?? const <String>{};
      for (final option in group.options) {
        if (picks.contains(option.id)) delta += option.priceDelta;
      }
    }
    return delta;
  }

  bool _validate(MenuProduct product) {
    for (final group in product.modifierGroups) {
      final picks = _selected[group.id]?.length ?? 0;
      if (picks < group.minSelections) return false;
      if (picks > group.maxSelections) return false;
    }
    return true;
  }

  void _addToCart(MenuProduct product) {
    if (!_validate(product)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى اختيار الخيارات المطلوبة')),
      );
      return;
    }
    final selectedOptions = <ModifierOption>[];
    for (final group in product.modifierGroups) {
      final picks = _selected[group.id] ?? const <String>{};
      for (final option in group.options) {
        if (picks.contains(option.id)) selectedOptions.add(option);
      }
    }
    ref.read(cartControllerProvider.notifier).addItem(
          branchId: widget.branchId,
          product: product,
          modifierOptions: selectedOptions,
          quantity: _quantity,
          notes: _notes.text.trim().isEmpty ? null : _notes.text.trim(),
        );
    context.go('/cart');
  }

  @override
  Widget build(BuildContext context) {
    final lookup = ProductLookup(branchId: widget.branchId, productId: widget.productId);
    final productAsync = ref.watch(productProvider(lookup));

    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل المنتج')),
      body: AsyncValueView<MenuProduct>(
        value: productAsync,
        onRetry: () => ref.invalidate(productProvider(lookup)),
        data: (product) {
          _ensureDefaults(product);
          final delta = _modifiersDelta(product);
          final unitPrice = product.price + delta;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: <Widget>[
              AspectRatio(
                aspectRatio: 16 / 10,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: product.imageUrl == null
                      ? Container(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.06),
                          child: const Center(child: Icon(Icons.local_cafe, size: 64)),
                        )
                      : Image.network(product.imageUrl!, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 16),
              Text(product.nameAr, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              Text(formatCurrency(unitPrice)),
              if (product.descriptionAr != null) ...<Widget>[
                const SizedBox(height: 12),
                Text(product.descriptionAr!,
                    style: Theme.of(context).textTheme.bodyMedium),
              ],
              const SizedBox(height: 16),
              for (final group in product.modifierGroups) ...<Widget>[
                const Divider(),
                Row(
                  children: <Widget>[
                    Text(group.nameAr,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    const Spacer(),
                    if (group.isRequired)
                      const Text('مطلوب',
                          style: TextStyle(fontSize: 12, color: Colors.redAccent)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  group.minSelections == group.maxSelections
                      ? 'اختر ${group.maxSelections}'
                      : 'اختر من ${group.minSelections} إلى ${group.maxSelections}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                for (final option in group.options)
                  _OptionTile(
                    label: option.nameAr,
                    priceDelta: option.priceDelta,
                    selected: _selected[group.id]?.contains(option.id) ?? false,
                    maxSelections: group.maxSelections,
                    onChanged: (selected) {
                      setState(() {
                        final set = _selected[group.id] ?? <String>{};
                        if (selected) {
                          if (group.maxSelections == 1) set.clear();
                          set.add(option.id);
                        } else {
                          set.remove(option.id);
                        }
                        _selected[group.id] = set;
                      });
                    },
                  ),
              ],
              const SizedBox(height: 16),
              const Divider(),
              const Text('ملاحظات', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              TextField(
                controller: _notes,
                maxLines: 2,
                decoration:
                    const InputDecoration(hintText: 'مثلاً: بدون سكر، حليب لوز'),
              ),
              const SizedBox(height: 16),
              Row(
                children: <Widget>[
                  const Text('الكمية',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline),
                    onPressed:
                        _quantity > 1 ? () => setState(() => _quantity--) : null,
                  ),
                  Text('$_quantity', style: Theme.of(context).textTheme.titleMedium),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: () => setState(() => _quantity++),
                  ),
                ],
              ),
              const SizedBox(height: 80),
            ],
          );
        },
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: productAsync.maybeWhen(
            data: (product) {
              final delta = _modifiersDelta(product);
              final total = (product.price + delta) * _quantity;
              return FilledButton(
                onPressed: () => _addToCart(product),
                child: Text('إضافة إلى السلة · ${formatCurrency(total)}'),
              );
            },
            orElse: () => const SizedBox(height: 56),
          ),
        ),
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.label,
    required this.priceDelta,
    required this.selected,
    required this.maxSelections,
    required this.onChanged,
  });

  final String label;
  final double priceDelta;
  final bool selected;
  final int maxSelections;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    final trailing = priceDelta == 0
        ? const SizedBox.shrink()
        : Text('+ ${formatCurrency(priceDelta)}');
    final icon = maxSelections == 1
        ? Icon(selected ? Icons.radio_button_checked : Icons.radio_button_unchecked)
        : Icon(selected ? Icons.check_box : Icons.check_box_outline_blank);
    return InkWell(
      onTap: () => onChanged(!selected),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: <Widget>[
            icon,
            const SizedBox(width: 12),
            Expanded(child: Text(label)),
            trailing,
          ],
        ),
      ),
    );
  }
}
