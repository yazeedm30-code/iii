import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ProductScreen extends StatelessWidget {
  const ProductScreen({super.key, required this.branchId, required this.productId});

  final String branchId;
  final String productId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل المنتج')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          AspectRatio(
            aspectRatio: 16 / 10,
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(24),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('منتج تجريبي', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          const Text('22 ر.س'),
          const SizedBox(height: 16),
          const Divider(),
          const Text('الإضافات والخيارات', style: TextStyle(fontWeight: FontWeight.w600)),
          CheckboxListTile(value: false, onChanged: (_) {}, title: const Text('حليب لوز (+4 ر.س)')),
          CheckboxListTile(value: false, onChanged: (_) {}, title: const Text('شوت إضافي (+3 ر.س)')),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: () => context.push('/cart'),
            child: const Text('إضافة إلى السلة'),
          ),
        ),
      ),
    );
  }
}
