import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('السلة')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Card(
            child: ListTile(
              leading: const Icon(Icons.local_cafe),
              title: const Text('لاتيه إسباني'),
              subtitle: const Text('كبير · شوت إضافي'),
              trailing: Text('22 ر.س', style: Theme.of(context).textTheme.titleSmall),
            ),
          ),
          const SizedBox(height: 24),
          const _SummaryRow(label: 'المجموع', value: '22 ر.س'),
          const _SummaryRow(label: 'الضريبة', value: '3.30 ر.س'),
          const Divider(height: 32),
          _SummaryRow(
            label: 'الإجمالي',
            value: '25.30 ر.س',
            isTotal: true,
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
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
