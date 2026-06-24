import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('طلباتي')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, i) => Card(
          child: ListTile(
            title: Text('طلب رقم #${1000 + i}'),
            subtitle: const Text('فرع الرياض - تم التسليم'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push('/orders/order-$i'),
          ),
        ),
      ),
    );
  }
}
